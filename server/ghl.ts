/**
 * GoHighLevel API v2 Service
 * Uses the GHL_API_KEY from environment (Agency-level Private Integration)
 * Handles sub-account provisioning, contacts, pipelines, conversations sync
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

function getAgencyToken(): string {
  const token = process.env.GHL_API_KEY;
  if (!token) throw new Error("GHL_API_KEY not configured");
  return token;
}

interface GhlApiOptions {
  method?: string;
  body?: Record<string, unknown>;
  token?: string; // optional: falls back to env GHL_API_KEY
}

async function ghlRequest<T>(endpoint: string, options: GhlApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const bearerToken = token ?? getAgencyToken();

  const res = await fetch(`${GHL_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
      Version: GHL_API_VERSION,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GHL API error ${res.status}: ${errorText}`);
  }

  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GhlLocation {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  timezone?: string;
  business?: { name?: string };
}

export interface GhlContact {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  country?: string;
  city?: string;
  state?: string;
  tags?: string[];
  source?: string;
  locationId?: string;
  dateAdded?: string;
  customFields?: Array<{ id: string; value: string }>;
}

export interface GhlPipeline {
  id: string;
  name: string;
  stages: Array<{ id: string; name: string; position: number }>;
}

export interface GhlOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  monetaryValue?: number;
  contact?: { id: string; name: string; email?: string };
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GhlConversation {
  id: string;
  contactId: string;
  locationId: string;
  type: string;
  status?: string;
  unreadCount: number;
  lastMessageBody?: string;
  lastMessageDate?: string;
  contact?: { name?: string; email?: string; phone?: string };
}

export interface GhlUser {
  id: string;
  name: string;
  email: string;
  locationIds: string[];
}

export interface CreateLocationInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  timezone?: string;
  companyId: string;
  token?: string;
}

export interface CreateLocationUserInput {
  locationId: string;
  name: string;
  email: string;
  phone?: string;
  role?: "admin" | "user";
  token?: string;
}

// ─── Locations ────────────────────────────────────────────────────────────────

/**
 * Lists all locations (sub-accounts) in the agency
 */
export async function listGhlLocations(): Promise<GhlLocation[]> {
  const response = await ghlRequest<{ locations: GhlLocation[] }>("/locations/search?limit=100");
  return response.locations ?? [];
}

/**
 * Gets a single GHL location by ID
 */
export async function getGhlLocation(locationId: string, token?: string): Promise<GhlLocation> {
  const response = await ghlRequest<{ location: GhlLocation }>(`/locations/${locationId}`, { token });
  return response.location;
}

/**
 * Creates a new sub-account (Location) in GoHighLevel for a new GetSales4Now customer
 */
export async function createGhlLocation(input: CreateLocationInput): Promise<GhlLocation> {
  const { token, companyId, ...locationData } = input;

  const payload = {
    ...locationData,
    companyId,
    settings: {
      allowDuplicateContact: false,
      allowDuplicateOpportunity: false,
      allowFacebookNameMerge: false,
      disableContactTimezone: false,
    },
  };

  const response = await ghlRequest<{ location: GhlLocation }>("/locations/", {
    method: "POST",
    body: payload,
    token,
  });

  return response.location;
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

/**
 * Lists contacts for a given location
 */
export async function listGhlContacts(locationId: string, limit = 20, skip = 0): Promise<{
  contacts: GhlContact[];
  total: number;
}> {
  const response = await ghlRequest<{ contacts: GhlContact[]; total: number }>(
    `/contacts/?locationId=${locationId}&limit=${limit}&skip=${skip}`
  );
  return { contacts: response.contacts ?? [], total: response.total ?? 0 };
}

/**
 * Creates a contact in a GHL location
 */
export async function createGhlContact(locationId: string, data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  source?: string;
}): Promise<GhlContact> {
  const response = await ghlRequest<{ contact: GhlContact }>("/contacts/", {
    method: "POST",
    body: { locationId, ...data },
  });
  return response.contact;
}

/**
 * Updates a contact in GHL
 */
export async function updateGhlContact(contactId: string, data: Partial<GhlContact>): Promise<GhlContact> {
  const response = await ghlRequest<{ contact: GhlContact }>(`/contacts/${contactId}`, {
    method: "PUT",
    body: data,
  });
  return response.contact;
}

// ─── Pipelines & Opportunities ────────────────────────────────────────────────

/**
 * Lists pipelines for a given location
 */
export async function listGhlPipelines(locationId: string): Promise<GhlPipeline[]> {
  const response = await ghlRequest<{ pipelines: GhlPipeline[] }>(
    `/opportunities/pipelines?locationId=${locationId}`
  );
  return response.pipelines ?? [];
}

/**
 * Lists opportunities in a pipeline
 */
export async function listGhlOpportunities(locationId: string, pipelineId?: string, limit = 20): Promise<{
  opportunities: GhlOpportunity[];
  total: number;
}> {
  const params = new URLSearchParams({ location_id: locationId, limit: String(limit) });
  if (pipelineId) params.set("pipeline_id", pipelineId);
  const response = await ghlRequest<{ opportunities: GhlOpportunity[]; total: number }>(
    `/opportunities/search?${params.toString()}`
  );
  return { opportunities: response.opportunities ?? [], total: response.total ?? 0 };
}

/**
 * Creates an opportunity in GHL
 */
export async function createGhlOpportunity(data: {
  locationId: string;
  pipelineId: string;
  pipelineStageId: string;
  name: string;
  contactId?: string;
  monetaryValue?: number;
  status?: string;
}): Promise<GhlOpportunity> {
  const response = await ghlRequest<{ opportunity: GhlOpportunity }>("/opportunities/", {
    method: "POST",
    body: data,
  });
  return response.opportunity;
}

// ─── Conversations ────────────────────────────────────────────────────────────

/**
 * Lists conversations for a given location
 */
export async function listGhlConversations(locationId: string, limit = 20): Promise<{
  conversations: GhlConversation[];
  total: number;
}> {
  const response = await ghlRequest<{ conversations: GhlConversation[]; total: number }>(
    `/conversations/search?locationId=${locationId}&limit=${limit}`
  );
  return { conversations: response.conversations ?? [], total: response.total ?? 0 };
}

/**
 * Sends a message in a conversation
 */
export async function sendGhlMessage(conversationId: string, data: {
  type: "SMS" | "Email" | "WhatsApp" | "IG" | "FB";
  message: string;
  subject?: string;
}): Promise<{ messageId: string }> {
  const response = await ghlRequest<{ messageId: string }>(
    `/conversations/${conversationId}/messages`,
    { method: "POST", body: data }
  );
  return response;
}

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * Creates a user in a GHL sub-account (Location)
 */
export async function createGhlLocationUser(input: CreateLocationUserInput): Promise<GhlUser> {
  const { locationId, token, ...userData } = input;

  const response = await ghlRequest<{ user: GhlUser }>("/users/", {
    method: "POST",
    body: {
      ...userData,
      locationIds: [locationId],
      type: "account",
      role: userData.role ?? "admin",
      permissions: {
        campaignsEnabled: true,
        campaignsReadOnly: false,
        contactsEnabled: true,
        workflowsEnabled: true,
        workflowsReadOnly: false,
        triggersEnabled: true,
        funnelsEnabled: true,
        websitesEnabled: false,
        opportunitiesEnabled: true,
        dashboardStatsEnabled: true,
        bulkRequestsEnabled: true,
        appointmentsEnabled: true,
        reviewsEnabled: true,
        onlineListingsEnabled: true,
        phoneCallEnabled: true,
        conversationsEnabled: true,
        assignedDataOnly: false,
        adwordsReportingEnabled: false,
        membershipEnabled: false,
        facebookAdsReportingEnabled: false,
        attributionsReportingEnabled: false,
        settingsEnabled: true,
        tagsEnabled: true,
        leadValueEnabled: true,
        marketingEnabled: true,
        agentReportingEnabled: true,
        botService: false,
        socialPlanner: true,
        bloggingEnabled: false,
        invoiceEnabled: true,
        affiliateManagerEnabled: false,
        contentAiEnabled: true,
        refundsEnabled: false,
        recordPaymentEnabled: true,
        cancelSubscriptionEnabled: true,
        paymentsEnabled: true,
        communitiesEnabled: false,
        exportPaymentsEnabled: false,
      },
    },
    token,
  });

  return response.user;
}

// ─── Validation & Agency Info ─────────────────────────────────────────────────

/**
 * Validates the agency GHL_API_KEY by making a test API call
 */
export async function validateGhlToken(token?: string): Promise<boolean> {
  try {
    await ghlRequest("/locations/search?limit=1", { token });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the agency/company ID from the configured GHL token
 */
export async function getGhlAgencyInfo(token?: string): Promise<{ companyId: string; name: string }> {
  const response = await ghlRequest<{ company: { id: string; name: string } }>("/companies/", { token });
  return { companyId: response.company.id, name: response.company.name };
}

// ─── Plan Limits ──────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  free: { contacts: 100, users: 1, campaigns: 2, socialPosts: 10, funnels: 1, aiCredits: 50, ghlSubAccount: false },
  starter: { contacts: 2500, users: 3, campaigns: 10, socialPosts: 50, funnels: 5, aiCredits: 300, ghlSubAccount: true },
  pro: { contacts: 5000, users: 5, campaigns: 20, socialPosts: 100, funnels: 10, aiCredits: 500, ghlSubAccount: true },
  business: { contacts: -1, users: 10, campaigns: -1, socialPosts: -1, funnels: -1, aiCredits: 2000, ghlSubAccount: true },
  agency: { contacts: -1, users: -1, campaigns: -1, socialPosts: -1, funnels: -1, aiCredits: -1, ghlSubAccount: true },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export const STRIPE_PRICE_IDS = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "",
  starter_yearly: process.env.STRIPE_PRICE_STARTER_YEARLY ?? "",
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
  business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? "",
  business_yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY ?? "",
  agency_monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY ?? "",
  agency_yearly: process.env.STRIPE_PRICE_AGENCY_YEARLY ?? "",
};
