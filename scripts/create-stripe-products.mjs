/**
 * Creates GetSales4Now subscription products and prices in Stripe.
 * Run once: node scripts/create-stripe-products.mjs
 */
import Stripe from "stripe";
import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" });

const PLANS = [
  {
    key: "starter",
    name: "GetSales4Now Starter",
    description: "2,500 contacts, 3 users, 10 campaigns, GHL sub-account included",
    monthly: 4900, // $49/month
    yearly: 47040, // $392/year (20% off)
  },
  {
    key: "pro",
    name: "GetSales4Now Pro",
    description: "5,000 contacts, 5 users, 20 campaigns, GHL sub-account included",
    monthly: 9900, // $99/month
    yearly: 95040, // $792/year (20% off)
  },
  {
    key: "business",
    name: "GetSales4Now Business",
    description: "Unlimited contacts, 10 users, unlimited campaigns, GHL sub-account included",
    monthly: 19900, // $199/month
    yearly: 191040, // $1,592/year (20% off)
  },
  {
    key: "agency",
    name: "GetSales4Now Agency",
    description: "Unlimited everything, unlimited users, white-label ready",
    monthly: 49900, // $499/month
    yearly: 479040, // $3,992/year (20% off)
  },
];

async function main() {
  console.log("Creating Stripe products and prices...\n");
  const priceIds = {};

  for (const plan of PLANS) {
    console.log(`Creating product: ${plan.name}`);

    // Create product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { plan: plan.key },
    });

    console.log(`  Product ID: ${product.id}`);

    // Monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.monthly,
      currency: "usd",
      recurring: { interval: "month" },
      nickname: `${plan.name} Monthly`,
      metadata: { plan: plan.key, billing: "monthly" },
    });

    console.log(`  Monthly Price ID: ${monthlyPrice.id}`);
    priceIds[`${plan.key}_monthly`] = monthlyPrice.id;

    // Yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.yearly,
      currency: "usd",
      recurring: { interval: "year" },
      nickname: `${plan.name} Yearly`,
      metadata: { plan: plan.key, billing: "yearly" },
    });

    console.log(`  Yearly Price ID: ${yearlyPrice.id}`);
    priceIds[`${plan.key}_yearly`] = yearlyPrice.id;
    console.log();
  }

  console.log("\n=== PRICE IDs CREATED ===");
  console.log(JSON.stringify(priceIds, null, 2));

  // Write to a file for reference
  writeFileSync(
    resolve(process.cwd(), "stripe-price-ids.json"),
    JSON.stringify(priceIds, null, 2)
  );

  console.log("\n✅ Saved to stripe-price-ids.json");
  console.log("\nAdd these to your .env file:");
  for (const [key, value] of Object.entries(priceIds)) {
    console.log(`STRIPE_PRICE_${key.toUpperCase()}=${value}`);
  }
}

main().catch(console.error);
