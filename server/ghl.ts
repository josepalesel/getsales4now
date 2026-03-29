/**
 * GoHighLevel API v2 Service
 * Handles sub-account (Location) provisioning for new GetSales4Now customers
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

interface GhlApiOptions {
  method?: string;
  body?: Record<string, unknown>;
  token: string;
}

async function ghlRequest<T>(endpoint: string, options: GhlApiOptions): Promise<T> {
  const { method = "GET", body, token } = options;
  const res = await fetch(`${GHL_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
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
  companyId: string; // Agency/Company ID in GHL
  token: string;
}

export interface GhlUser {
  id: string;
  name: string;
  email: string;
  locationIds: string[];
}

export interface CreateLocationUserInput {
  locationId: string;
  name: string;
  email: string;
  phone?: string;
  role?: "admin" | "user";
  token: string;
}

/**
 * Creates a new sub-account (Location) in GoHighLevel for a new customer
 */
export async function createGhlLocation(input: CreateLocationInput): Promise<GhlLocation> {
  const { token, companyId, ...locationData } = input;

  const payload = {
    ...locationData,
    companyId,
    // Default settings for new GetSales4Now customers
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

/**
 * Gets a GHL location by ID
 */
export async function getGhlLocation(locationId: string, token: string): Promise<GhlLocation> {
  const response = await ghlRequest<{ location: GhlLocation }>(`/locations/${locationId}`, {
    token,
  });
  return response.location;
}

/**
 * Gets the agency/company ID from a GHL token
 */
export async function getGhlAgencyInfo(token: string): Promise<{ companyId: string; name: string }> {
  const response = await ghlRequest<{ company: { id: string; name: string } }>("/companies/", {
    token,
  });
  return { companyId: response.company.id, name: response.company.name };
}

/**
 * Validates a GHL token by making a test API call
 */
export async function validateGhlToken(token: string): Promise<boolean> {
  try {
    await ghlRequest("/locations/?limit=1", { token });
    return true;
  } catch {
    return false;
  }
}

/**
 * Plan limits configuration
 */
export const PLAN_LIMITS = {
  free: {
    contacts: 100,
    users: 1,
    campaigns: 2,
    socialPosts: 10,
    funnels: 1,
    aiCredits: 50,
    ghlSubAccount: false,
  },
  pro: {
    contacts: 5000,
    users: 3,
    campaigns: 20,
    socialPosts: 100,
    funnels: 10,
    aiCredits: 500,
    ghlSubAccount: true,
  },
  business: {
    contacts: -1, // unlimited
    users: 10,
    campaigns: -1,
    socialPosts: -1,
    funnels: -1,
    aiCredits: 2000,
    ghlSubAccount: true,
  },
  agency: {
    contacts: -1,
    users: -1,
    campaigns: -1,
    socialPosts: -1,
    funnels: -1,
    aiCredits: -1, // unlimited
    ghlSubAccount: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

/**
 * Stripe Price IDs for each plan (set in environment or products.ts)
 * These will be populated from environment variables
 */
export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
  business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? "",
  business_yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY ?? "",
  agency_monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY ?? "",
  agency_yearly: process.env.STRIPE_PRICE_AGENCY_YEARLY ?? "",
};
