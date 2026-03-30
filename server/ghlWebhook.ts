/**
 * GoHighLevel Webhook Handler for GetSales4Now
 * Receives real-time events from GHL and syncs data to the local database.
 *
 * GHL sends webhooks for: ContactCreate, ContactUpdate, ContactDelete,
 * OpportunityCreate, OpportunityUpdate, ConversationUnreadUpdate, etc.
 *
 * Register this webhook URL in your GHL account under:
 * Settings → Integrations → Webhooks → Add New Webhook
 * URL: https://getsales4now.agency/api/ghl/webhook
 */
import type { Express, Request, Response } from "express";
import { getDb } from "./db";
import { contacts, opportunities, conversations } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

interface GhlWebhookPayload {
  type: string;
  locationId: string;
  id?: string;
  contactId?: string;
  // Contact fields
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  // Opportunity fields
  name?: string;
  monetaryValue?: number;
  pipelineStageId?: string;
  status?: string;
  // Conversation fields
  conversationType?: string;
  lastMessageDate?: string;
  // Timestamps
  dateAdded?: string;
  dateUpdated?: string;
}

export function registerGhlWebhook(app: Express) {
  /**
   * GHL sends a GET request to verify the webhook endpoint during setup.
   */
  app.get("/api/ghl/webhook", (req: Request, res: Response) => {
    const challenge = req.query["hub.challenge"];
    if (challenge) {
      return res.send(challenge);
    }
    return res.json({ status: "GHL Webhook endpoint active", version: "1.0" });
  });

  /**
   * Main webhook receiver — processes GHL events.
   */
  app.post("/api/ghl/webhook", async (req: Request, res: Response) => {
    const payload = req.body as GhlWebhookPayload;

    if (!payload?.type || !payload?.locationId) {
      return res.status(400).json({ error: "Invalid payload: missing type or locationId" });
    }

    console.log(`[GHL Webhook] Event: ${payload.type} | Location: ${payload.locationId}`);

    try {
      const db = await getDb();
      if (!db) {
        console.error("[GHL Webhook] Database not available");
        return res.status(500).json({ error: "Database unavailable" });
      }

      switch (payload.type) {
        // ─── Contact Events ───────────────────────────────────────────────────
        case "ContactCreate":
        case "ContactUpdate": {
          const ghlContactId = payload.id ?? payload.contactId;
          if (!ghlContactId) break;

          const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ").trim() || "Unknown";

          // Find the user who owns this location
          const { subscriptions } = await import("../drizzle/schema");
          const [sub] = await db
            .select({ userId: subscriptions.userId })
            .from(subscriptions)
            .where(eq(subscriptions.ghlLocationId, payload.locationId))
            .limit(1);

          if (!sub?.userId) {
            console.warn(`[GHL Webhook] No user found for location ${payload.locationId}`);
            break;
          }

          const [existing] = await db
            .select({ id: contacts.id })
            .from(contacts)
            .where(and(eq(contacts.userId, sub.userId), eq(contacts.ghlContactId, ghlContactId)))
            .limit(1);

          const nameParts = fullName.split(" ");
          const contactData = {
            firstName: nameParts[0] ?? "Unknown",
            lastName: nameParts.slice(1).join(" ") || null,
            email: payload.email ?? null,
            phone: payload.phone ?? null,
            company: payload.companyName ?? null,
            ghlContactId,
            ghlLocationId: payload.locationId,
            ghlSyncedAt: new Date(),
            updatedAt: new Date(),
          };

          if (existing) {
            await db.update(contacts).set(contactData).where(eq(contacts.id, existing.id));
            console.log(`[GHL Webhook] Contact updated: ${ghlContactId}`);
          } else {
            await db.insert(contacts).values({ ...contactData, userId: sub.userId, status: "new" });
            console.log(`[GHL Webhook] Contact created: ${ghlContactId}`);
          }
          break;
        }

        case "ContactDelete": {
          const ghlContactId = payload.id ?? payload.contactId;
          if (!ghlContactId) break;

          // Soft delete: mark as deleted rather than removing
          await db
            .update(contacts)
            .set({ status: "inactive", updatedAt: new Date() })
            .where(eq(contacts.ghlContactId, ghlContactId));

          console.log(`[GHL Webhook] Contact soft-deleted: ${ghlContactId}`);
          break;
        }

        // ─── Opportunity Events ───────────────────────────────────────────────
        case "OpportunityCreate":
        case "OpportunityUpdate": {
          const ghlOppId = payload.id;
          if (!ghlOppId) break;

          const { subscriptions } = await import("../drizzle/schema");
          const [sub] = await db
            .select({ userId: subscriptions.userId })
            .from(subscriptions)
            .where(eq(subscriptions.ghlLocationId, payload.locationId))
            .limit(1);

          if (!sub?.userId) break;

          const statusMap: Record<string, "open" | "won" | "lost"> = {
            open: "open", won: "won", lost: "lost", abandoned: "lost",
          };

          const [existing] = await db
            .select({ id: opportunities.id })
            .from(opportunities)
            .where(and(eq(opportunities.userId, sub.userId), eq(opportunities.ghlOpportunityId, ghlOppId)))
            .limit(1);

          const oppData = {
            title: payload.name ?? "Untitled Opportunity",
            value: payload.monetaryValue ? String(payload.monetaryValue) : null,
            stage: payload.pipelineStageId ?? "new",
            status: statusMap[payload.status?.toLowerCase() ?? "open"] ?? "open",
            ghlOpportunityId: ghlOppId,
            ghlLocationId: payload.locationId,
            ghlSyncedAt: new Date(),
            updatedAt: new Date(),
          };

          if (existing) {
            await db.update(opportunities).set(oppData).where(eq(opportunities.id, existing.id));
          } else {
            await db.insert(opportunities).values({ ...oppData, userId: sub.userId });
          }

          console.log(`[GHL Webhook] Opportunity ${payload.type === "OpportunityCreate" ? "created" : "updated"}: ${ghlOppId}`);
          break;
        }

        // ─── Conversation Events ──────────────────────────────────────────────
        case "ConversationUnreadUpdate":
        case "InboundMessage": {
          const ghlConvId = payload.id ?? payload.contactId;
          if (!ghlConvId) break;

          const { subscriptions } = await import("../drizzle/schema");
          const [sub] = await db
            .select({ userId: subscriptions.userId })
            .from(subscriptions)
            .where(eq(subscriptions.ghlLocationId, payload.locationId))
            .limit(1);

          if (!sub?.userId) break;

          const channelMap: Record<string, "whatsapp" | "email" | "sms" | "webchat" | "voice"> = {
            SMS: "sms", Email: "email", WhatsApp: "whatsapp", IG: "webchat", FB: "webchat", GMB: "webchat",
          };

          const [existing] = await db
            .select({ id: conversations.id })
            .from(conversations)
            .where(and(eq(conversations.userId, sub.userId), eq(conversations.ghlConversationId, ghlConvId)))
            .limit(1);

          const convData = {
            channel: channelMap[payload.conversationType ?? "SMS"] ?? "sms",
            status: "open" as const,
            lastMessageAt: payload.lastMessageDate ? new Date(payload.lastMessageDate) : new Date(),
            ghlConversationId: ghlConvId,
            ghlLocationId: payload.locationId,
            ghlSyncedAt: new Date(),
            updatedAt: new Date(),
          };

          if (existing) {
            await db.update(conversations).set(convData).where(eq(conversations.id, existing.id));
          } else {
            await db.insert(conversations).values({ ...convData, userId: sub.userId });
          }

          console.log(`[GHL Webhook] Conversation updated: ${ghlConvId}`);
          break;
        }

        default:
          console.log(`[GHL Webhook] Unhandled event type: ${payload.type}`);
      }

      return res.json({ received: true, type: payload.type });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[GHL Webhook] Error processing event ${payload.type}: ${message}`);
      return res.status(500).json({ error: message });
    }
  });
}
