import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── USERS ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // i18n preferences
  uiLanguage: varchar("uiLanguage", { length: 10 }).default("en").notNull(),
  operationalLanguage: varchar("operationalLanguage", { length: 10 }).default("en"),
  timezone: varchar("timezone", { length: 64 }).default("America/New_York"),
  country: varchar("country", { length: 4 }),
  currency: varchar("currency", { length: 8 }).default("USD"),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  onboardingStep: int("onboardingStep").default(0),
  businessType: varchar("businessType", { length: 64 }),
  businessName: text("businessName"),
  primaryObjective: varchar("primaryObjective", { length: 64 }),
  brandVoice: varchar("brandVoice", { length: 64 }),
  targetAudience: text("targetAudience"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── CONTACTS ─────────────────────────────────────────────────────────────────
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  whatsapp: varchar("whatsapp", { length: 30 }),
  company: varchar("company", { length: 200 }),
  jobTitle: varchar("jobTitle", { length: 100 }),
  country: varchar("country", { length: 4 }),
  language: varchar("language", { length: 10 }).default("en"),
  tags: json("tags").$type<string[]>().default([]),
  leadScore: int("leadScore").default(0),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "converted", "lost", "inactive"]).default("new"),
  source: varchar("source", { length: 64 }),
  notes: text("notes"),
  lastContactedAt: timestamp("lastContactedAt"),
  nextActionAt: timestamp("nextActionAt"),
  nextAction: text("nextAction"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// ─── COMPANIES ────────────────────────────────────────────────────────────────
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  website: varchar("website", { length: 300 }),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  country: varchar("country", { length: 4 }),
  city: varchar("city", { length: 100 }),
  size: mysqlEnum("size", ["1-10", "11-50", "51-200", "201-500", "500+"]).default("1-10"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ─── PIPELINES ────────────────────────────────────────────────────────────────
export const pipelines = mysqlTable("pipelines", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  stages: json("stages").$type<{ id: string; name: string; color: string; order: number }[]>().default([]),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Pipeline = typeof pipelines.$inferSelect;

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────────
export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactId: int("contactId"),
  companyId: int("companyId"),
  pipelineId: int("pipelineId"),
  title: varchar("title", { length: 200 }).notNull(),
  value: decimal("value", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 8 }).default("USD"),
  stage: varchar("stage", { length: 64 }).default("new"),
  probability: int("probability").default(0),
  expectedCloseDate: timestamp("expectedCloseDate"),
  status: mysqlEnum("status", ["open", "won", "lost"]).default("open"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

// ─── TASKS ────────────────────────────────────────────────────────────────────
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactId: int("contactId"),
  opportunityId: int("opportunityId"),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  dueAt: timestamp("dueAt"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  status: mysqlEnum("status", ["pending", "in_progress", "done", "cancelled"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  objective: mysqlEnum("objective", ["leads", "sales", "booking", "retention", "followup", "reactivation"]).default("leads"),
  channel: mysqlEnum("channel", ["email", "whatsapp", "sms", "multi"]).default("email"),
  language: varchar("language", { length: 10 }).default("en"),
  status: mysqlEnum("status", ["draft", "pending_approval", "active", "paused", "completed", "cancelled"]).default("draft"),
  targetNiche: varchar("targetNiche", { length: 64 }),
  sequence: json("sequence").$type<{ step: number; type: string; delay: number; content: string; subject?: string }[]>().default([]),
  stats: json("stats").$type<{ sent: number; opened: number; clicked: number; converted: number }>().default({ sent: 0, opened: 0, clicked: 0, converted: 0 }),
  scheduledAt: timestamp("scheduledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// ─── SOCIAL POSTS ─────────────────────────────────────────────────────────────
export const socialPosts = mysqlTable("social_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  contentVariants: json("contentVariants").$type<{ lang: string; content: string }[]>().default([]),
  channels: json("channels").$type<string[]>().default([]),
  mediaUrls: json("mediaUrls").$type<string[]>().default([]),
  hashtags: json("hashtags").$type<string[]>().default([]),
  postType: mysqlEnum("postType", ["organic", "ad", "story", "reel"]).default("organic"),
  audience: mysqlEnum("audience", ["b2b", "b2c", "both"]).default("both"),
  language: varchar("language", { length: 10 }).default("en"),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed"]).default("draft"),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  stats: json("stats").$type<{ likes: number; comments: number; shares: number; reach: number; clicks: number }>().default({ likes: 0, comments: 0, shares: 0, reach: 0, clicks: 0 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;

// ─── FUNNELS ──────────────────────────────────────────────────────────────────
export const funnels = mysqlTable("funnels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  objective: varchar("objective", { length: 64 }),
  niche: varchar("niche", { length: 64 }),
  language: varchar("language", { length: 10 }).default("en"),
  status: mysqlEnum("status", ["draft", "active", "paused", "archived"]).default("draft"),
  steps: json("steps").$type<{ id: string; type: string; name: string; url?: string; conversionRate?: number }[]>().default([]),
  stats: json("stats").$type<{ visitors: number; leads: number; conversions: number }>().default({ visitors: 0, leads: 0, conversions: 0 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Funnel = typeof funnels.$inferSelect;
export type InsertFunnel = typeof funnels.$inferInsert;

// ─── CONVERSATIONS ────────────────────────────────────────────────────────────
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactId: int("contactId"),
  channel: mysqlEnum("channel", ["whatsapp", "email", "sms", "webchat", "voice"]).notNull(),
  status: mysqlEnum("status", ["open", "pending", "resolved", "bot"]).default("open"),
  assignedTo: int("assignedTo"),
  language: varchar("language", { length: 10 }).default("en"),
  detectedLanguage: varchar("detectedLanguage", { length: 10 }),
  intentLabel: varchar("intentLabel", { length: 100 }),
  summary: text("summary"),
  lastMessageAt: timestamp("lastMessageAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "agent", "bot", "system"]).notNull(),
  content: text("content").notNull(),
  mediaUrl: text("mediaUrl"),
  transcription: text("transcription"),
  suggestedReply: text("suggestedReply"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── AI AGENT ACTIONS ─────────────────────────────────────────────────────────
export const agentActions = mysqlTable("agent_actions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentType: mysqlEnum("agentType", ["central", "crm", "content", "funnel", "support", "reports"]).notNull(),
  action: varchar("action", { length: 200 }).notNull(),
  input: json("input"),
  output: text("output"),
  status: mysqlEnum("status", ["pending_approval", "approved", "rejected", "executed", "failed"]).default("pending_approval"),
  requiresApproval: boolean("requiresApproval").default(false),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  executedAt: timestamp("executedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentAction = typeof agentActions.$inferSelect;
export type InsertAgentAction = typeof agentActions.$inferInsert;

// ─── INTEGRATIONS ─────────────────────────────────────────────────────────────
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: mysqlEnum("provider", ["ghl", "n8n", "whatsapp", "email", "meta", "linkedin", "telephony", "webhook"]).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["connected", "disconnected", "error", "pending"]).default("pending"),
  config: json("config").$type<Record<string, string>>().default({}),
  lastCheckedAt: timestamp("lastCheckedAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

// ─── TEMPLATES ────────────────────────────────────────────────────────────────
export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  type: mysqlEnum("type", ["campaign", "social_post", "funnel", "email", "whatsapp", "sms", "bot"]).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  niche: varchar("niche", { length: 64 }),
  objective: varchar("objective", { length: 64 }),
  content: text("content").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  isSystem: boolean("isSystem").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
export const auditLogs = mysqlTable("audit_logs", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 200 }).notNull(),
  entity: varchar("entity", { length: 64 }),
  entityId: int("entityId"),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
