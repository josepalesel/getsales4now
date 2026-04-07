/**
 * Stripe Webhook Handler for GetSales4Now
 * Handles subscription events and triggers GS4N sub-account provisioning
 */
import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { subscriptions, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { PLAN_LIMITS, type PlanType } from "./ghl";
import { notifyOwner } from "./_core/notification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-03-25.dahlia" });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

function getPlanFromPriceId(priceId: string): PlanType {
  const priceMap: Record<string, PlanType> = {
    [process.env.STRIPE_PRICE_STARTER_MONTHLY ?? ""]:  "basic",
    [process.env.STRIPE_PRICE_STARTER_YEARLY ?? ""]:   "basic",
    [process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? ""]: "business",
    [process.env.STRIPE_PRICE_BUSINESS_YEARLY ?? ""]:  "business",
    // Corp is contact-us only — no Stripe price IDs
  };
  return priceMap[priceId] ?? "basic";
}

export function registerStripeWebhook(app: Express) {
  // CRITICAL: Must use raw body parser BEFORE express.json() to preserve raw body for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      // FIX #2: Guard against missing webhook secret — fail fast with a clear log
      if (!webhookSecret) {
        console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured. Cannot verify webhook signature.");
        return res.status(500).json({ error: "Webhook secret not configured on server." });
      }

      const sig = req.headers["stripe-signature"] as string;

      if (!sig) {
        console.error("[Stripe Webhook] Missing stripe-signature header");
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`[Stripe Webhook] Signature verification failed: ${message}`);
        return res.status(400).json({ error: `Webhook signature verification failed: ${message}` });
      }

      // FIX #1: Removed the "evt_test_" bypass.
      // Stripe test-mode events do NOT start with "evt_test_" — that prefix does not exist.
      // The old guard was incorrectly silently dropping all events in test mode.
      // All events (live and test) should be processed normally.

      console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`);

      try {
        const db = await getDb();
        if (!db) {
          console.error("[Stripe Webhook] Database not available");
          return res.status(500).json({ error: "Database unavailable" });
        }

        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = parseInt(session.metadata?.user_id ?? "0");
            const plan = (session.metadata?.plan ?? "basic") as PlanType;
            const stripeCustomerId = session.customer as string;
            const stripeSubscriptionId = session.subscription as string;

            if (!userId) {
              console.error("[Stripe Webhook] Missing user_id in session metadata");
              break;
            }

            const limits = PLAN_LIMITS[plan];

            // FIX #3: Retrieve the actual price ID from the subscription line items,
            // not from session.metadata.price_id which was never populated.
            let stripePriceId: string | null = null;
            if (stripeSubscriptionId) {
              try {
                const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
                stripePriceId = subscription.items.data[0]?.price.id ?? null;
              } catch (e) {
                console.warn("[Stripe Webhook] Could not retrieve subscription price ID:", e);
              }
            }

            // Upsert subscription record
            const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

            if (existing.length > 0) {
              await db.update(subscriptions).set({
                plan,
                status: "active",
                stripeCustomerId,
                stripeSubscriptionId,
                stripePriceId,
                contactsLimit: limits.contacts,
                usersLimit: limits.users,
                ghlStatus: "pending", // Ready for GS4N provisioning
                updatedAt: new Date(),
              }).where(eq(subscriptions.userId, userId));
            } else {
              await db.insert(subscriptions).values({
                userId,
                plan,
                status: "active",
                stripeCustomerId,
                stripeSubscriptionId,
                stripePriceId,
                contactsLimit: limits.contacts,
                usersLimit: limits.users,
                ghlStatus: "pending",
              });
            }

            // Notify owner
            const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            await notifyOwner({
              title: `Nova assinatura: ${plan.toUpperCase()}`,
              content: `${user?.name ?? "Usuário"} (${user?.email ?? ""}) assinou o plano ${plan}. Sub-conta GS4N aguardando configuração.`,
            });

            console.log(`[Stripe Webhook] Subscription created for user ${userId} - plan: ${plan}`);
            break;
          }

          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const stripeCustomerId = subscription.customer as string;

            const [sub] = await db.select().from(subscriptions)
              .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
              .limit(1);

            if (sub) {
              const priceId = subscription.items.data[0]?.price.id ?? "";
              const plan = getPlanFromPriceId(priceId);
              const limits = PLAN_LIMITS[plan];

              await db.update(subscriptions).set({
                plan,
                status: subscription.status as "active" | "trialing" | "past_due" | "canceled" | "incomplete",
                stripePriceId: priceId,
                contactsLimit: limits.contacts,
                usersLimit: limits.users,
                currentPeriodStart: subscription.items.data[0]?.current_period_start ? new Date(subscription.items.data[0].current_period_start * 1000) : undefined,
                currentPeriodEnd: subscription.items.data[0]?.current_period_end ? new Date(subscription.items.data[0].current_period_end * 1000) : undefined,
                updatedAt: new Date(),
              }).where(eq(subscriptions.stripeCustomerId, stripeCustomerId));

              console.log(`[Stripe Webhook] Subscription updated for customer ${stripeCustomerId} - plan: ${plan}`);
            }
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const stripeCustomerId = subscription.customer as string;

            await db.update(subscriptions).set({
              status: "canceled",
              canceledAt: new Date(),
              plan: "free",
              contactsLimit: PLAN_LIMITS.free.contacts,
              usersLimit: PLAN_LIMITS.free.users,
              updatedAt: new Date(),
            }).where(eq(subscriptions.stripeCustomerId, stripeCustomerId));

            console.log(`[Stripe Webhook] Subscription canceled for customer ${stripeCustomerId}`);
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            const stripeCustomerId = invoice.customer as string;

            await db.update(subscriptions).set({
              status: "past_due",
              updatedAt: new Date(),
            }).where(eq(subscriptions.stripeCustomerId, stripeCustomerId));

            console.log(`[Stripe Webhook] Payment failed for customer ${stripeCustomerId}`);
            break;
          }

          case "invoice.paid": {
            const invoice = event.data.object as Stripe.Invoice;
            const stripeCustomerId = invoice.customer as string;

            await db.update(subscriptions).set({
              status: "active",
              updatedAt: new Date(),
            }).where(eq(subscriptions.stripeCustomerId, stripeCustomerId));

            console.log(`[Stripe Webhook] Invoice paid for customer ${stripeCustomerId}`);
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        return res.json({ received: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Stripe Webhook] Error processing event ${event.type}: ${message}`);
        return res.status(500).json({ error: message });
      }
    }
  );
}
