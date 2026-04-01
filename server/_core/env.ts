/**
 * Centralized environment configuration for GetSales4Now server.
 *
 * FIX: Added APP_URL, GHL, and Stripe env vars to the ENV object so they
 * are validated and accessible in a single place. This prevents the bug
 * where the checkout success_url was falling back to a hardcoded domain
 * when the origin header was absent (e.g., in server-to-server calls).
 */
export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // App URL — used for Stripe success/cancel redirect URLs
  // Set this to your production domain, e.g. https://getsales4now.agency
  appUrl: process.env.APP_URL ?? "",

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceStarterMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "",
  stripePriceStarterYearly: process.env.STRIPE_PRICE_STARTER_YEARLY ?? "",
  stripePriceBusinessMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? "",
  stripePriceBusinessYearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY ?? "",

  // GoHighLevel
  ghlApiKey: process.env.GHL_API_KEY ?? "",
  ghlCompanyId: process.env.GHL_COMPANY_ID ?? "",
  ghlWebhookSecret: process.env.GHL_WEBHOOK_SECRET ?? "",
};

/**
 * Logs a startup warning for any critical env vars that are missing.
 * Call this once at server startup to catch configuration issues early.
 */
export function validateEnv() {
  const required: Array<keyof typeof ENV> = [
    "databaseUrl",
    "stripeSecretKey",
    "stripeWebhookSecret",
    "ghlApiKey",
    "ghlCompanyId",
    "appUrl",
  ];

  const missing = required.filter((key) => !ENV[key]);

  if (missing.length > 0) {
    console.warn(
      `[ENV] WARNING: The following required environment variables are not set:\n` +
      missing.map((k) => `  - ${k.toUpperCase().replace(/([A-Z])/g, "_$1").replace(/^_/, "")}`).join("\n") +
      `\nSome features may not work correctly until these are configured.`
    );
  }

  return missing.length === 0;
}
