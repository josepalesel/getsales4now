/**
 * Script to create updated Stripe products and prices for GetSales4Now
 * Plans: Starter ($118/month) and Business ($398/month)
 * Corp plan is "contact us" - no Stripe price needed
 */
import Stripe from "stripe";
import dotenv from "dotenv";
import { readFileSync } from "fs";

// Load env
try {
  const env = readFileSync("/home/ubuntu/getsales4now/.env", "utf8");
  env.split("\n").forEach(line => {
    const [key, ...vals] = line.split("=");
    if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
  });
} catch {}

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error("❌ STRIPE_SECRET_KEY not found in environment");
  process.exit(1);
}

const stripe = new Stripe(stripeKey, { apiVersion: "2026-03-25.dahlia" });

async function createPlans() {
  console.log("🚀 Creating GetSales4Now updated plans in Stripe...\n");

  const plans = [
    {
      key: "starter",
      name: "GetSales4Now Starter",
      description: "CRM completo, Pipeline de vendas, Automação básica de follow-up, Landing pages e funis, Calendário e agendamentos",
      monthly: 11800, // $118.00 in cents
    },
    {
      key: "business",
      name: "GetSales4Now Business",
      description: "Tudo do Starter + Workflows avançados, Relatórios completos, Melhor suporte e onboarding, Prioridade no suporte",
      monthly: 39800, // $398.00 in cents
    },
  ];

  const results = {};

  for (const plan of plans) {
    console.log(`📦 Creating product: ${plan.name}`);

    // Create product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { plan_key: plan.key, platform: "getsales4now" },
    });

    console.log(`   ✅ Product created: ${product.id}`);

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.monthly,
      currency: "usd",
      recurring: { interval: "month" },
      nickname: `${plan.name} - Monthly`,
      metadata: { plan_key: plan.key, billing_period: "monthly" },
    });

    console.log(`   ✅ Monthly price: ${monthlyPrice.id} ($${plan.monthly / 100}/month)`);

    // Create yearly price (20% discount)
    const yearlyAmount = Math.round(plan.monthly * 12 * 0.8);
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: yearlyAmount,
      currency: "usd",
      recurring: { interval: "year" },
      nickname: `${plan.name} - Yearly (20% off)`,
      metadata: { plan_key: plan.key, billing_period: "yearly" },
    });

    console.log(`   ✅ Yearly price: ${yearlyPrice.id} ($${yearlyAmount / 100}/year)`);

    results[plan.key] = {
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
      yearlyPriceId: yearlyPrice.id,
    };
  }

  console.log("\n✅ All plans created successfully!\n");
  console.log("=== COPY THESE PRICE IDs TO YOUR SECRETS ===\n");
  console.log(`STRIPE_PRICE_STARTER_MONTHLY=${results.starter.monthlyPriceId}`);
  console.log(`STRIPE_PRICE_STARTER_YEARLY=${results.starter.yearlyPriceId}`);
  console.log(`STRIPE_PRICE_BUSINESS_MONTHLY=${results.business.monthlyPriceId}`);
  console.log(`STRIPE_PRICE_BUSINESS_YEARLY=${results.business.yearlyPriceId}`);
  console.log("\n=== JSON OUTPUT ===");
  console.log(JSON.stringify(results, null, 2));

  return results;
}

createPlans().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
