import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import {
  users,
  contacts,
  companies,
  opportunities,
  pipelines,
  tasks,
  campaigns,
  socialPosts,
  funnels,
  conversations,
  messages,
  agentActions,
  integrations,
  templates,
} from "../drizzle/schema";
import { eq, desc, and, like, or } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

// ─── AUTH ROUTER ──────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ─── ONBOARDING ROUTER ────────────────────────────────────────────────────────
const onboardingRouter = router({
  complete: protectedProcedure
    .input(z.object({
      language: z.enum(["en", "es", "pt"]),
      country: z.string(),
      businessType: z.string(),
      businessName: z.string(),
      primaryObjective: z.string(),
      channels: z.array(z.string()),
      brandVoice: z.string(),
      targetAudience: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(users)
        .set({
          uiLanguage: input.language,
          operationalLanguage: input.language,
          country: input.country,
          businessType: input.businessType,
          businessName: input.businessName,
          primaryObjective: input.primaryObjective,
          brandVoice: input.brandVoice,
          targetAudience: input.targetAudience,
          onboardingCompleted: true,
          onboardingStep: 8,
        })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { completed: false, step: 0 };
    const result = await db.select({
      onboardingCompleted: users.onboardingCompleted,
      onboardingStep: users.onboardingStep,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return result[0] ?? { onboardingCompleted: false, onboardingStep: 0 };
  }),
});

// ─── CRM ROUTER ───────────────────────────────────────────────────────────────
const crmRouter = router({
  // Contacts
  listContacts: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const conditions = [eq(contacts.userId, ctx.user.id)];
      if (input.status) conditions.push(eq(contacts.status, input.status as "new" | "contacted" | "qualified" | "converted" | "lost" | "inactive"));
      const items = await db.select().from(contacts)
        .where(and(...conditions))
        .orderBy(desc(contacts.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      return { items, total: items.length };
    }),

  createContact: protectedProcedure
    .input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      company: z.string().optional(),
      jobTitle: z.string().optional(),
      country: z.string().optional(),
      language: z.string().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(contacts).values({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  updateContact: protectedProcedure
    .input(z.object({
      id: z.number(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      status: z.string().optional(),
      leadScore: z.number().optional(),
      nextAction: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { id, status, ...rest } = input;
      const updateData: Record<string, unknown> = { ...rest };
      if (status) updateData.status = status as "new" | "contacted" | "qualified" | "converted" | "lost" | "inactive";
      await db.update(contacts).set(updateData).where(and(eq(contacts.id, id), eq(contacts.userId, ctx.user.id)));
      return { success: true };
    }),

  deleteContact: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(contacts).where(and(eq(contacts.id, input.id), eq(contacts.userId, ctx.user.id)));
      return { success: true };
    }),

  // Companies
  listCompanies: protectedProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const items = await db.select().from(companies)
        .where(eq(companies.userId, ctx.user.id))
        .orderBy(desc(companies.createdAt))
        .limit(input.limit).offset(input.offset);
      return { items, total: items.length };
    }),

  createCompany: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      industry: z.string().optional(),
      website: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(companies).values({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  // Opportunities
  listOpportunities: protectedProcedure
    .input(z.object({ pipelineId: z.number().optional(), status: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(opportunities.userId, ctx.user.id)];
      if (input.status) conditions.push(eq(opportunities.status, input.status as "open" | "won" | "lost"));
      if (input.pipelineId) conditions.push(eq(opportunities.pipelineId, input.pipelineId));
      return db.select().from(opportunities).where(and(...conditions)).orderBy(desc(opportunities.createdAt));
    }),

  createOpportunity: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      contactId: z.number().optional(),
      companyId: z.number().optional(),
      pipelineId: z.number().optional(),
      value: z.string().optional(),
      stage: z.string().optional(),
      probability: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(opportunities).values({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  updateOpportunityStage: protectedProcedure
    .input(z.object({ id: z.number(), stage: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(opportunities).set({ stage: input.stage })
        .where(and(eq(opportunities.id, input.id), eq(opportunities.userId, ctx.user.id)));
      return { success: true };
    }),

  // Tasks
  listTasks: protectedProcedure
    .input(z.object({ status: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(tasks.userId, ctx.user.id)];
      if (input.status) conditions.push(eq(tasks.status, input.status as "pending" | "in_progress" | "done" | "cancelled"));
      return db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt));
    }),

  createTask: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      contactId: z.number().optional(),
      opportunityId: z.number().optional(),
      dueAt: z.date().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(tasks).values({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  // Pipelines
  listPipelines: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(pipelines).where(eq(pipelines.userId, ctx.user.id));
  }),

  createPipeline: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      stages: z.array(z.object({ id: z.string(), name: z.string(), color: z.string(), order: z.number() })),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(pipelines).values({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  // AI suggestion for next action
  suggestNextAction: protectedProcedure
    .input(z.object({ contactId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [contact] = await db.select().from(contacts)
        .where(and(eq(contacts.id, input.contactId), eq(contacts.userId, ctx.user.id))).limit(1);
      if (!contact) throw new Error("Contact not found");

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a CRM assistant. Suggest the next best action for a sales rep to take with this contact. Be concise and practical. Reply in the same language as the contact's language field." },
          { role: "user", content: `Contact: ${contact.firstName} ${contact.lastName ?? ""}, Status: ${contact.status}, Lead Score: ${contact.leadScore}, Last contacted: ${contact.lastContactedAt ?? "never"}, Notes: ${contact.notes ?? "none"}` },
        ],
      });
      const rawSuggestion = response.choices[0]?.message?.content;
      const suggestion = typeof rawSuggestion === "string" ? rawSuggestion : "Follow up with a personalized message.";
      await db.update(contacts).set({ nextAction: suggestion }).where(eq(contacts.id, input.contactId));
      return { suggestion };
    }),
});

// ─── CAMPAIGNS ROUTER ─────────────────────────────────────────────────────────
const campaignsRouter = router({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional(), channel: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(campaigns.userId, ctx.user.id)];
      if (input.status) conditions.push(eq(campaigns.status, input.status as "draft" | "pending_approval" | "active" | "paused" | "completed" | "cancelled"));
      if (input.channel) conditions.push(eq(campaigns.channel, input.channel as "email" | "whatsapp" | "sms" | "multi"));
      return db.select().from(campaigns).where(and(...conditions)).orderBy(desc(campaigns.createdAt));
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      objective: z.enum(["leads", "sales", "booking", "retention", "followup", "reactivation"]),
      channel: z.enum(["email", "whatsapp", "sms", "multi"]),
      language: z.string().optional(),
      targetNiche: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(campaigns).values({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "pending_approval", "active", "paused", "completed", "cancelled"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(campaigns).set({ status: input.status })
        .where(and(eq(campaigns.id, input.id), eq(campaigns.userId, ctx.user.id)));
      return { success: true };
    }),

  generateContent: protectedProcedure
    .input(z.object({
      objective: z.string(),
      channel: z.string(),
      niche: z.string(),
      language: z.string(),
      brandVoice: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const langMap: Record<string, string> = { en: "English", es: "Spanish (Latin American)", pt: "Brazilian Portuguese" };
      const response = await invokeLLM({
        messages: [
          { role: "system", content: `You are a marketing copywriter specializing in small business campaigns. Write in ${langMap[input.language] ?? "English"}.` },
          { role: "user", content: `Create a ${input.channel} campaign for a ${input.niche} business with objective: ${input.objective}. Brand voice: ${input.brandVoice ?? "friendly"}. Include subject line (if email), main message, and CTA. Format as JSON with fields: subject, message, cta.` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "campaign_content",
            strict: true,
            schema: {
              type: "object",
              properties: {
                subject: { type: "string" },
                message: { type: "string" },
                cta: { type: "string" },
              },
              required: ["subject", "message", "cta"],
              additionalProperties: false,
            },
          },
        },
      });
      const rawContent = response.choices[0]?.message?.content;
      const content = JSON.parse(typeof rawContent === "string" ? rawContent : "{}");
      return content as { subject: string; message: string; cta: string };
    }),

  listTemplates: protectedProcedure
    .input(z.object({ type: z.string().optional(), language: z.string().optional(), niche: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(templates.isSystem, true)];
      if (input.type) conditions.push(eq(templates.type, input.type as "campaign" | "social_post" | "funnel" | "email" | "whatsapp" | "sms" | "bot"));
      if (input.language) conditions.push(eq(templates.language, input.language));
      if (input.niche) conditions.push(eq(templates.niche, input.niche));
      return db.select().from(templates).where(and(...conditions));
    }),
});

// ─── SOCIAL MEDIA ROUTER ──────────────────────────────────────────────────────
const socialRouter = router({
  listPosts: protectedProcedure
    .input(z.object({ status: z.string().optional(), month: z.number().optional(), year: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(socialPosts.userId, ctx.user.id)];
      if (input.status) conditions.push(eq(socialPosts.status, input.status as "draft" | "scheduled" | "published" | "failed"));
      return db.select().from(socialPosts).where(and(...conditions)).orderBy(desc(socialPosts.createdAt));
    }),

  createPost: protectedProcedure
    .input(z.object({
      content: z.string().min(1),
      channels: z.array(z.string()),
      hashtags: z.array(z.string()).optional(),
      postType: z.enum(["organic", "ad", "story", "reel"]).optional(),
      audience: z.enum(["b2b", "b2c", "both"]).optional(),
      language: z.string().optional(),
      scheduledAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const status = input.scheduledAt ? "scheduled" : "draft";
      await db.insert(socialPosts).values({ ...input, userId: ctx.user.id, status });
      return { success: true };
    }),

  generatePost: protectedProcedure
    .input(z.object({
      topic: z.string(),
      niche: z.string(),
      language: z.string(),
      audience: z.enum(["b2b", "b2c", "both"]),
      tone: z.string().optional(),
      includeHashtags: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const langMap: Record<string, string> = { en: "English", es: "Spanish (Latin American)", pt: "Brazilian Portuguese" };
      const response = await invokeLLM({
        messages: [
          { role: "system", content: `You are a social media expert for small businesses. Write in ${langMap[input.language] ?? "English"}. Target audience: ${input.audience}. Tone: ${input.tone ?? "friendly"}.` },
          { role: "user", content: `Create an engaging social media post for a ${input.niche} business about: ${input.topic}. ${input.includeHashtags ? "Include 5-8 relevant hashtags." : ""} Format as JSON with fields: content, hashtags (array).` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "social_post",
            strict: true,
            schema: {
              type: "object",
              properties: {
                content: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
              },
              required: ["content", "hashtags"],
              additionalProperties: false,
            },
          },
        },
      });
      const rawSocial = response.choices[0]?.message?.content;
      return JSON.parse(typeof rawSocial === "string" ? rawSocial : "{}") as { content: string; hashtags: string[] };
    }),
});

// ─── FUNNELS ROUTER ───────────────────────────────────────────────────────────
const funnelsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(funnels).where(eq(funnels.userId, ctx.user.id)).orderBy(desc(funnels.createdAt));
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      objective: z.string().optional(),
      niche: z.string().optional(),
      language: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const defaultSteps = [
        { id: "landing", type: "landing_page", name: "Landing Page", conversionRate: 0 },
        { id: "form", type: "form", name: "Lead Form", conversionRate: 0 },
        { id: "thankyou", type: "thank_you", name: "Thank You Page", conversionRate: 0 },
      ];
      await db.insert(funnels).values({ ...input, userId: ctx.user.id, steps: defaultSteps });
      return { success: true };
    }),

  generateCopy: protectedProcedure
    .input(z.object({
      funnelId: z.number(),
      stepType: z.string(),
      niche: z.string(),
      language: z.string(),
      objective: z.string(),
    }))
    .mutation(async ({ input }) => {
      const langMap: Record<string, string> = { en: "English", es: "Spanish (Latin American)", pt: "Brazilian Portuguese" };
      const response = await invokeLLM({
        messages: [
          { role: "system", content: `You are a conversion copywriter. Write in ${langMap[input.language] ?? "English"}.` },
          { role: "user", content: `Write copy for a ${input.stepType} page for a ${input.niche} business. Objective: ${input.objective}. Return JSON with: headline, subheadline, body, cta_button_text.` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "funnel_copy",
            strict: true,
            schema: {
              type: "object",
              properties: {
                headline: { type: "string" },
                subheadline: { type: "string" },
                body: { type: "string" },
                cta_button_text: { type: "string" },
              },
              required: ["headline", "subheadline", "body", "cta_button_text"],
              additionalProperties: false,
            },
          },
        },
      });
      const rawFunnel = response.choices[0]?.message?.content;
      return JSON.parse(typeof rawFunnel === "string" ? rawFunnel : "{}") as { headline: string; subheadline: string; body: string; cta_button_text: string };
    }),
});

// ─── INBOX ROUTER ─────────────────────────────────────────────────────────────
const inboxRouter = router({
  listConversations: protectedProcedure
    .input(z.object({ status: z.string().optional(), channel: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(conversations.userId, ctx.user.id)];
      if (input.status) conditions.push(eq(conversations.status, input.status as "open" | "pending" | "resolved" | "bot"));
      if (input.channel) conditions.push(eq(conversations.channel, input.channel as "whatsapp" | "email" | "sms" | "webchat" | "voice"));
      return db.select().from(conversations).where(and(...conditions)).orderBy(desc(conversations.lastMessageAt));
    }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(messages).where(eq(messages.conversationId, input.conversationId)).orderBy(messages.sentAt);
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      content: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(messages).values({ conversationId: input.conversationId, role: "agent", content: input.content });
      await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, input.conversationId));
      return { success: true };
    }),

  suggestReply: protectedProcedure
    .input(z.object({ conversationId: z.number(), lastMessage: z.string(), language: z.string().optional() }))
    .mutation(async ({ input }) => {
      const langMap: Record<string, string> = { en: "English", es: "Spanish (Latin American)", pt: "Brazilian Portuguese" };
      const response = await invokeLLM({
        messages: [
          { role: "system", content: `You are a helpful customer support agent. Reply in ${langMap[input.language ?? "en"] ?? "English"}. Be concise, friendly and professional.` },
          { role: "user", content: `Suggest a reply to this customer message: "${input.lastMessage}"` },
        ],
      });
      return { suggestion: response.choices[0]?.message?.content ?? "" };
    }),

  createConversation: protectedProcedure
    .input(z.object({
      channel: z.enum(["whatsapp", "email", "sms", "webchat", "voice"]),
      contactId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(conversations).values({ ...input, userId: ctx.user.id });
      return { success: true };
    }),
});

// ─── AI ROUTER ────────────────────────────────────────────────────────────────
const aiRouter = router({
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
      agentType: z.enum(["central", "crm", "content", "funnel", "support", "reports"]),
      language: z.string().optional(),
      history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const [userData] = db ? await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1) : [null];
      const langMap: Record<string, string> = { en: "English", es: "Spanish (Latin American)", pt: "Brazilian Portuguese" };
      const lang = input.language ?? userData?.uiLanguage ?? "en";

      const systemPrompts: Record<string, string> = {
        central: `You are the central AI assistant for GetSales4Now, a marketing and CRM platform. Help small business owners with any question about their business, marketing, sales, and operations. Always respond in ${langMap[lang] ?? "English"}. Be friendly, practical, and avoid jargon. The user's business type is: ${userData?.businessType ?? "unknown"}.`,
        crm: `You are a CRM specialist assistant. Help with contact management, lead scoring, pipeline optimization, and follow-up strategies. Respond in ${langMap[lang] ?? "English"}.`,
        content: `You are a content marketing specialist. Help create posts, campaigns, email sequences, and marketing copy. Respond in ${langMap[lang] ?? "English"}.`,
        funnel: `You are a conversion optimization expert. Help design and improve sales funnels, landing pages, and lead capture strategies. Respond in ${langMap[lang] ?? "English"}.`,
        support: `You are a customer support specialist. Help craft responses, manage conversations, and improve customer satisfaction. Respond in ${langMap[lang] ?? "English"}.`,
        reports: `You are a business analytics expert. Help interpret metrics, identify trends, and suggest actionable improvements. Respond in ${langMap[lang] ?? "English"}.`,
      };

      const historyMessages = (input.history ?? []).map((h) => ({ role: h.role, content: h.content }));

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompts[input.agentType] ?? systemPrompts.central },
          ...historyMessages,
          { role: "user", content: input.message },
        ],
      });

      const rawContent = response.choices[0]?.message?.content;
      const reply = typeof rawContent === "string" ? rawContent : "I'm here to help!";

      // Log the action
      if (db) {
        await db.insert(agentActions).values({
          userId: ctx.user.id,
          agentType: input.agentType,
          action: input.message.slice(0, 200),
          output: reply.slice(0, 500),
          status: "executed",
          requiresApproval: false,
        });
      }

      return { reply };
    }),

  listActions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(agentActions)
      .where(eq(agentActions.userId, ctx.user.id))
      .orderBy(desc(agentActions.createdAt))
      .limit(20);
  }),
});

// ─── REPORTS ROUTER ───────────────────────────────────────────────────────────
const reportsRouter = router({
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return {
      totalContacts: 0,
      newLeadsThisMonth: 0,
      openOpportunities: 0,
      activeCampaigns: 0,
      openConversations: 0,
      totalRevenue: 0,
    };

    const [contactCount] = await db.select().from(contacts).where(eq(contacts.userId, ctx.user.id));
    const [oppCount] = await db.select().from(opportunities)
      .where(and(eq(opportunities.userId, ctx.user.id), eq(opportunities.status, "open")));
    const [campaignCount] = await db.select().from(campaigns)
      .where(and(eq(campaigns.userId, ctx.user.id), eq(campaigns.status, "active")));
    const [convCount] = await db.select().from(conversations)
      .where(and(eq(conversations.userId, ctx.user.id), eq(conversations.status, "open")));

    return {
      totalContacts: contactCount ? 1 : 0,
      newLeadsThisMonth: 0,
      openOpportunities: oppCount ? 1 : 0,
      activeCampaigns: campaignCount ? 1 : 0,
      openConversations: convCount ? 1 : 0,
      totalRevenue: 0,
    };
  }),

  getAISummary: protectedProcedure
    .input(z.object({ language: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const langMap: Record<string, string> = { en: "English", es: "Spanish (Latin American)", pt: "Brazilian Portuguese" };
      const lang = input.language ?? "en";

      const response = await invokeLLM({
        messages: [
          { role: "system", content: `You are a business analytics assistant. Respond in ${langMap[lang] ?? "English"}. Be concise and actionable.` },
          { role: "user", content: "Give me 3 actionable suggestions to improve my sales and marketing performance this week. Format as a simple numbered list." },
        ],
      });
      const rawSummary = response.choices[0]?.message?.content;
      const summary = typeof rawSummary === "string" ? rawSummary : "";
      return { summary };
    }),
});

// ─── INTEGRATIONS ROUTER ──────────────────────────────────────────────────────
const integrationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(integrations).where(eq(integrations.userId, ctx.user.id));
  }),

  connect: protectedProcedure
    .input(z.object({
      provider: z.enum(["ghl", "n8n", "whatsapp", "email", "meta", "linkedin", "telephony", "webhook"]),
      name: z.string(),
      config: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(integrations).values({
        provider: input.provider,
        name: input.name,
        userId: ctx.user.id,
        config: (input.config ?? {}) as Record<string, string>,
        status: "connected",
        lastCheckedAt: new Date(),
      });
      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["connected", "disconnected", "error", "pending"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(integrations).set({ status: input.status, lastCheckedAt: new Date() })
        .where(and(eq(integrations.id, input.id), eq(integrations.userId, ctx.user.id)));
      return { success: true };
    }),
});

// ─── APP ROUTER ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  onboarding: onboardingRouter,
  crm: crmRouter,
  campaigns: campaignsRouter,
  social: socialRouter,
  funnels: funnelsRouter,
  inbox: inboxRouter,
  ai: aiRouter,
  reports: reportsRouter,
  integrations: integrationsRouter,
});

export type AppRouter = typeof appRouter;
