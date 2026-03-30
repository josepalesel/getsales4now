/**
 * GetSales4Now — GHL Sync Router
 * Handles real-time data synchronization between GoHighLevel and the local CRM.
 * Imports contacts, opportunities, and conversations from GHL sub-accounts.
 */
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  contacts,
  opportunities,
  conversations,
  pipelines,
  integrations,
  subscriptions,
} from "../../drizzle/schema";
import {
  listGhlLocations,
  listGhlContacts,
  listGhlPipelines,
  listGhlOpportunities,
  listGhlConversations,
  type GhlContact,
  type GhlOpportunity,
  type GhlConversation,
  type GhlPipeline,
} from "../ghl";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getUserGhlConfig(userId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

  // Get GHL integration config for this user
  const [integration] = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.provider, "ghl")))
    .limit(1);

  if (!integration || integration.status !== "connected") {
    return null;
  }

  const config = integration.config as Record<string, string>;
  return {
    locationId: config.locationId,
    token: config.token,
    companyId: config.companyId,
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const ghlSyncRouter = router({
  /**
   * Get the user's GHL connection status and available locations
   */
  getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { connected: false, locations: [] };

    const [integration] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.userId, ctx.user.id), eq(integrations.provider, "ghl")))
      .limit(1);

    if (!integration || integration.status !== "connected") {
      return { connected: false, locations: [] };
    }

    const config = integration.config as Record<string, string>;
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);

    return {
      connected: true,
      locationId: config.locationId,
      locationName: sub?.ghlLocationName ?? "Your Account",
      companyId: config.companyId,
      lastSync: sub?.ghlProvisionedAt ?? null,
    };
  }),

  /**
   * List all available GHL locations (sub-accounts) for the agency token
   */
  listLocations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const locations = await listGhlLocations();
      return { locations };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Failed to list GHL locations: ${msg}` });
    }
  }),

  /**
   * Sync contacts from GHL to local CRM
   * Upserts based on ghlContactId to avoid duplicates
   */
  syncContacts: protectedProcedure
    .input(z.object({
      locationId: z.string().optional(),
      limit: z.number().default(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Get GHL config
      const ghlConfig = await getUserGhlConfig(ctx.user.id);
      const locationId = input.locationId ?? ghlConfig?.locationId;

      if (!locationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No GHL location configured. Please complete the GHL onboarding first.",
        });
      }

      try {
        // Fetch contacts from GHL
        const { contacts: ghlContactList, total } = await listGhlContacts(locationId, input.limit, 0);

        let created = 0;
        let updated = 0;
        const errors: string[] = [];

        for (const ghlContact of ghlContactList) {
          try {
            // Check if contact already exists
            const [existing] = await db
              .select({ id: contacts.id })
              .from(contacts)
              .where(and(eq(contacts.userId, ctx.user.id), eq(contacts.ghlContactId, ghlContact.id)))
              .limit(1);

            const contactData = {
              firstName: ghlContact.firstName || ghlContact.name?.split(" ")[0] || "Unknown",
              lastName: ghlContact.lastName || ghlContact.name?.split(" ").slice(1).join(" ") || null,
              email: ghlContact.email || null,
              phone: ghlContact.phone || null,
              company: ghlContact.companyName || null,
              country: ghlContact.country || null,
              source: ghlContact.source || "ghl",
              tags: ghlContact.tags || [],
              ghlContactId: ghlContact.id,
              ghlLocationId: locationId,
              ghlSyncedAt: new Date(),
              updatedAt: new Date(),
            };

            if (existing) {
              await db
                .update(contacts)
                .set(contactData)
                .where(eq(contacts.id, existing.id));
              updated++;
            } else {
              await db.insert(contacts).values({
                ...contactData,
                userId: ctx.user.id,
              });
              created++;
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown";
            errors.push(`Contact ${ghlContact.id}: ${msg}`);
          }
        }

        return {
          success: true,
          synced: created + updated,
          created,
          updated,
          total,
          errors: errors.slice(0, 5), // Return first 5 errors only
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `GHL contacts sync failed: ${msg}` });
      }
    }),

  /**
   * Sync pipelines and opportunities from GHL to local CRM
   */
  syncOpportunities: protectedProcedure
    .input(z.object({
      locationId: z.string().optional(),
      limit: z.number().default(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const ghlConfig = await getUserGhlConfig(ctx.user.id);
      const locationId = input.locationId ?? ghlConfig?.locationId;

      if (!locationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No GHL location configured. Please complete the GHL onboarding first.",
        });
      }

      try {
        // Fetch pipelines first
        const ghlPipelines = await listGhlPipelines(locationId);
        let pipelinesSynced = 0;

        // Upsert pipelines locally
        for (const ghlPipeline of ghlPipelines) {
          const stages = (ghlPipeline.stages ?? []).map((s, idx) => ({
            id: s.id,
            name: s.name,
            color: "#6366f1",
            order: idx,
          }));

          const [existingPipeline] = await db
            .select({ id: pipelines.id })
            .from(pipelines)
            .where(and(eq(pipelines.userId, ctx.user.id), eq(pipelines.name, ghlPipeline.name)))
            .limit(1);

          if (!existingPipeline) {
            await db.insert(pipelines).values({
              userId: ctx.user.id,
              name: ghlPipeline.name,
              stages,
              isDefault: pipelinesSynced === 0,
            });
            pipelinesSynced++;
          }
        }

        // Fetch opportunities
        const { opportunities: ghlOpps, total } = await listGhlOpportunities(locationId, undefined, input.limit);

        let created = 0;
        let updated = 0;
        const errors: string[] = [];

        for (const ghlOpp of ghlOpps) {
          try {
            const [existing] = await db
              .select({ id: opportunities.id })
              .from(opportunities)
              .where(and(eq(opportunities.userId, ctx.user.id), eq(opportunities.ghlOpportunityId, ghlOpp.id)))
              .limit(1);

            // Map GHL status to local status
            const statusMap: Record<string, "open" | "won" | "lost"> = {
              open: "open",
              won: "won",
              lost: "lost",
              abandoned: "lost",
            };

            const oppData = {
              title: ghlOpp.name,
              value: ghlOpp.monetaryValue ? String(ghlOpp.monetaryValue) : null,
              stage: ghlOpp.pipelineStageId || "new",
              status: statusMap[ghlOpp.status?.toLowerCase() ?? "open"] ?? "open",
              ghlOpportunityId: ghlOpp.id,
              ghlLocationId: locationId,
              ghlSyncedAt: new Date(),
              updatedAt: new Date(),
            };

            if (existing) {
              await db
                .update(opportunities)
                .set(oppData)
                .where(eq(opportunities.id, existing.id));
              updated++;
            } else {
              await db.insert(opportunities).values({
                ...oppData,
                userId: ctx.user.id,
              });
              created++;
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown";
            errors.push(`Opportunity ${ghlOpp.id}: ${msg}`);
          }
        }

        return {
          success: true,
          pipelinesSynced,
          synced: created + updated,
          created,
          updated,
          total,
          errors: errors.slice(0, 5),
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `GHL opportunities sync failed: ${msg}` });
      }
    }),

  /**
   * Sync conversations from GHL Inbox to local Inbox
   */
  syncConversations: protectedProcedure
    .input(z.object({
      locationId: z.string().optional(),
      limit: z.number().default(50),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const ghlConfig = await getUserGhlConfig(ctx.user.id);
      const locationId = input.locationId ?? ghlConfig?.locationId;

      if (!locationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No GHL location configured. Please complete the GHL onboarding first.",
        });
      }

      try {
        const { conversations: ghlConvs, total } = await listGhlConversations(locationId, input.limit);

        let created = 0;
        let updated = 0;
        const errors: string[] = [];

        for (const ghlConv of ghlConvs) {
          try {
            const [existing] = await db
              .select({ id: conversations.id })
              .from(conversations)
              .where(and(eq(conversations.userId, ctx.user.id), eq(conversations.ghlConversationId, ghlConv.id)))
              .limit(1);

            // Map GHL channel type
            const channelMap: Record<string, "whatsapp" | "email" | "sms" | "webchat" | "voice"> = {
              SMS: "sms",
              Email: "email",
              WhatsApp: "whatsapp",
              IG: "webchat",
              FB: "webchat",
              GMB: "webchat",
              Live_Chat: "webchat",
              Call: "voice",
            };

            const channel = channelMap[ghlConv.type ?? "SMS"] ?? "sms";

            // Map GHL status
            const statusMap: Record<string, "open" | "pending" | "resolved" | "bot"> = {
              open: "open",
              unread: "open",
              read: "open",
              archived: "resolved",
            };

            const convData = {
              channel,
              status: statusMap[ghlConv.status?.toLowerCase() ?? "open"] ?? "open",
              lastMessageAt: ghlConv.lastMessageDate ? new Date(ghlConv.lastMessageDate) : new Date(),
              ghlConversationId: ghlConv.id,
              ghlLocationId: locationId,
              ghlSyncedAt: new Date(),
              updatedAt: new Date(),
            };

            if (existing) {
              await db
                .update(conversations)
                .set(convData)
                .where(eq(conversations.id, existing.id));
              updated++;
            } else {
              await db.insert(conversations).values({
                ...convData,
                userId: ctx.user.id,
              });
              created++;
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown";
            errors.push(`Conversation ${ghlConv.id}: ${msg}`);
          }
        }

        return {
          success: true,
          synced: created + updated,
          created,
          updated,
          total,
          errors: errors.slice(0, 5),
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `GHL conversations sync failed: ${msg}` });
      }
    }),

  /**
   * Full sync — runs all sync operations in sequence
   */
  syncAll: protectedProcedure
    .input(z.object({
      locationId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const ghlConfig = await getUserGhlConfig(ctx.user.id);
      const locationId = input.locationId ?? ghlConfig?.locationId;

      if (!locationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No GHL location configured. Please complete the GHL onboarding first.",
        });
      }

      const results = {
        contacts: { synced: 0, created: 0, updated: 0, errors: [] as string[] },
        opportunities: { synced: 0, created: 0, updated: 0, pipelinesSynced: 0, errors: [] as string[] },
        conversations: { synced: 0, created: 0, updated: 0, errors: [] as string[] },
        syncedAt: new Date(),
      };

      // Sync contacts
      try {
        const { contacts: ghlContactList } = await listGhlContacts(locationId, 100, 0);
        for (const ghlContact of ghlContactList) {
          try {
            const [existing] = await db
              .select({ id: contacts.id })
              .from(contacts)
              .where(and(eq(contacts.userId, ctx.user.id), eq(contacts.ghlContactId, ghlContact.id)))
              .limit(1);

            const contactData = {
              firstName: ghlContact.firstName || ghlContact.name?.split(" ")[0] || "Unknown",
              lastName: ghlContact.lastName || ghlContact.name?.split(" ").slice(1).join(" ") || null,
              email: ghlContact.email || null,
              phone: ghlContact.phone || null,
              company: ghlContact.companyName || null,
              country: ghlContact.country || null,
              source: ghlContact.source || "ghl",
              tags: ghlContact.tags || [],
              ghlContactId: ghlContact.id,
              ghlLocationId: locationId,
              ghlSyncedAt: new Date(),
              updatedAt: new Date(),
            };

            if (existing) {
              await db.update(contacts).set(contactData).where(eq(contacts.id, existing.id));
              results.contacts.updated++;
            } else {
              await db.insert(contacts).values({ ...contactData, userId: ctx.user.id });
              results.contacts.created++;
            }
            results.contacts.synced++;
          } catch (err) {
            results.contacts.errors.push(`Contact ${ghlContact.id}: ${err instanceof Error ? err.message : "Unknown"}`);
          }
        }
      } catch (err) {
        results.contacts.errors.push(`Fetch failed: ${err instanceof Error ? err.message : "Unknown"}`);
      }

      // Sync pipelines + opportunities
      try {
        const ghlPipelines = await listGhlPipelines(locationId);
        for (const ghlPipeline of ghlPipelines) {
          const stages = (ghlPipeline.stages ?? []).map((s, idx) => ({
            id: s.id,
            name: s.name,
            color: "#6366f1",
            order: idx,
          }));
          const [existingPipeline] = await db
            .select({ id: pipelines.id })
            .from(pipelines)
            .where(and(eq(pipelines.userId, ctx.user.id), eq(pipelines.name, ghlPipeline.name)))
            .limit(1);
          if (!existingPipeline) {
            await db.insert(pipelines).values({
              userId: ctx.user.id,
              name: ghlPipeline.name,
              stages,
              isDefault: results.opportunities.pipelinesSynced === 0,
            });
            results.opportunities.pipelinesSynced++;
          }
        }

        const { opportunities: ghlOpps } = await listGhlOpportunities(locationId, undefined, 100);
        const statusMap: Record<string, "open" | "won" | "lost"> = { open: "open", won: "won", lost: "lost", abandoned: "lost" };

        for (const ghlOpp of ghlOpps) {
          try {
            const [existing] = await db
              .select({ id: opportunities.id })
              .from(opportunities)
              .where(and(eq(opportunities.userId, ctx.user.id), eq(opportunities.ghlOpportunityId, ghlOpp.id)))
              .limit(1);

            const oppData = {
              title: ghlOpp.name,
              value: ghlOpp.monetaryValue ? String(ghlOpp.monetaryValue) : null,
              stage: ghlOpp.pipelineStageId || "new",
              status: statusMap[ghlOpp.status?.toLowerCase() ?? "open"] ?? "open",
              ghlOpportunityId: ghlOpp.id,
              ghlLocationId: locationId,
              ghlSyncedAt: new Date(),
              updatedAt: new Date(),
            };

            if (existing) {
              await db.update(opportunities).set(oppData).where(eq(opportunities.id, existing.id));
              results.opportunities.updated++;
            } else {
              await db.insert(opportunities).values({ ...oppData, userId: ctx.user.id });
              results.opportunities.created++;
            }
            results.opportunities.synced++;
          } catch (err) {
            results.opportunities.errors.push(`Opp ${ghlOpp.id}: ${err instanceof Error ? err.message : "Unknown"}`);
          }
        }
      } catch (err) {
        results.opportunities.errors.push(`Fetch failed: ${err instanceof Error ? err.message : "Unknown"}`);
      }

      // Sync conversations
      try {
        const { conversations: ghlConvs } = await listGhlConversations(locationId, 50);
        const channelMap: Record<string, "whatsapp" | "email" | "sms" | "webchat" | "voice"> = {
          SMS: "sms", Email: "email", WhatsApp: "whatsapp", IG: "webchat", FB: "webchat", GMB: "webchat", Live_Chat: "webchat", Call: "voice",
        };
        const statusMap: Record<string, "open" | "pending" | "resolved" | "bot"> = {
          open: "open", unread: "open", read: "open", archived: "resolved",
        };

        for (const ghlConv of ghlConvs) {
          try {
            const [existing] = await db
              .select({ id: conversations.id })
              .from(conversations)
              .where(and(eq(conversations.userId, ctx.user.id), eq(conversations.ghlConversationId, ghlConv.id)))
              .limit(1);

            const convData = {
              channel: channelMap[ghlConv.type ?? "SMS"] ?? "sms",
              status: statusMap[ghlConv.status?.toLowerCase() ?? "open"] ?? "open",
              lastMessageAt: ghlConv.lastMessageDate ? new Date(ghlConv.lastMessageDate) : new Date(),
              ghlConversationId: ghlConv.id,
              ghlLocationId: locationId,
              ghlSyncedAt: new Date(),
              updatedAt: new Date(),
            };

            if (existing) {
              await db.update(conversations).set(convData).where(eq(conversations.id, existing.id));
              results.conversations.updated++;
            } else {
              await db.insert(conversations).values({ ...convData, userId: ctx.user.id });
              results.conversations.created++;
            }
            results.conversations.synced++;
          } catch (err) {
            results.conversations.errors.push(`Conv ${ghlConv.id}: ${err instanceof Error ? err.message : "Unknown"}`);
          }
        }
      } catch (err) {
        results.conversations.errors.push(`Fetch failed: ${err instanceof Error ? err.message : "Unknown"}`);
      }

      return { success: true, results };
    }),

  /**
   * Get sync statistics — how many records are synced from GHL
   */
  getSyncStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const [contactCount] = await db
      .select({ count: contacts.id })
      .from(contacts)
      .where(and(eq(contacts.userId, ctx.user.id)));

    const [oppCount] = await db
      .select({ count: opportunities.id })
      .from(opportunities)
      .where(and(eq(opportunities.userId, ctx.user.id)));

    const [convCount] = await db
      .select({ count: conversations.id })
      .from(conversations)
      .where(and(eq(conversations.userId, ctx.user.id)));

    return {
      contacts: contactCount?.count ?? 0,
      opportunities: oppCount?.count ?? 0,
      conversations: convCount?.count ?? 0,
    };
  }),
});
