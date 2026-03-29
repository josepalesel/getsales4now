import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CreditCard, Clock, Shield, Check, ArrowRight, Zap, Building2 } from "lucide-react";

const PLAN_DETAILS = {
  starter: {
    name: "Starter",
    price: "$118",
    period: "/month",
    icon: Zap,
    color: "text-orange-400",
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-500/10",
    features: ["5,000 contacts", "3 team members", "Email & WhatsApp", "CRM + Pipeline", "AI content"],
  },
  business: {
    name: "Business",
    price: "$398",
    period: "/month",
    icon: Building2,
    color: "text-red-400",
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/10",
    features: ["Unlimited contacts", "10 team members", "All channels", "AI copilots (6)", "GHL sub-account"],
  },
  pro: {
    name: "Starter",
    price: "$118",
    period: "/month",
    icon: Zap,
    color: "text-orange-400",
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-500/10",
    features: ["5,000 contacts", "3 team members", "Email & WhatsApp", "CRM + Pipeline", "AI content"],
  },
  free: {
    name: "Free",
    price: "$0",
    period: "/month",
    icon: Zap,
    color: "text-gray-400",
    borderColor: "border-gray-500/30",
    bgColor: "bg-gray-500/10",
    features: ["100 contacts", "1 user", "Basic CRM"],
  },
};

export default function Checkout() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Parse plan from URL
  const params = new URLSearchParams(window.location.search);
  const planParam = params.get("plan") ?? "starter";
  const isTrial = params.get("trial") === "true";

  const planKey = (planParam === "pro" ? "starter" : planParam) as keyof typeof PLAN_DETAILS;
  const plan = PLAN_DETAILS[planKey] ?? PLAN_DETAILS.starter;
  const PlanIcon = plan.icon;

  const createCheckoutMutation = trpc.billing.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.info("Stripe checkout opened in a new tab. Complete your payment there.");
      }
      setIsLoading(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start checkout. Please try again.");
      setIsLoading(false);
    },
  });

  const handleCheckout = () => {
    setIsLoading(true);
    createCheckoutMutation.mutate({
      plan: planParam === "starter" ? "pro" : planParam === "business" ? "business" : "pro",
      billing: "monthly",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">GS</div>
          <span className="text-white font-bold text-lg">GetSales4Now</span>
        </div>
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <Shield className="w-4 h-4" />
          Secured by Stripe
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Trial badge */}
          {isTrial && (
            <div className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-green-400 text-sm font-medium mb-6 w-fit mx-auto">
              <Clock className="w-4 h-4" />
              14-day free trial — you won't be charged today
            </div>
          )}

          <div className="bg-[#0d1526] border border-white/10 rounded-2xl overflow-hidden">
            {/* Plan summary */}
            <div className={`p-6 border-b border-white/10 ${plan.bgColor}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${plan.bgColor} border ${plan.borderColor} flex items-center justify-center`}>
                  <PlanIcon className={`w-5 h-5 ${plan.color}`} />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">{plan.name} Plan</h2>
                  <p className="text-white/50 text-sm">Digital Marketing & Sales Automation</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-black ${plan.color}`}>{plan.price}</span>
                <span className="text-white/40 text-sm">{plan.period}</span>
              </div>

              {isTrial && (
                <div className="mt-3 text-white/60 text-sm">
                  First charge: <strong className="text-white">after 14-day trial ends</strong>
                </div>
              )}
            </div>

            {/* Features included */}
            <div className="p-6 border-b border-white/10">
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">What's included</h3>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/80 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* What happens next */}
            <div className="p-6 border-b border-white/10">
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">What happens next</h3>
              <ol className="space-y-3">
                {[
                  { step: "1", text: "Click the button below to open Stripe's secure checkout" },
                  { step: "2", text: "Add your credit card — no charge for 14 days" },
                  { step: "3", text: "Return here to set up your GoHighLevel sub-account" },
                  { step: "4", text: "Start using all features immediately" },
                ].map((item) => (
                  <li key={item.step} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <span className="text-white/60 text-sm">{item.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* CTA */}
            <div className="p-6 space-y-3">
              <Button
                onClick={handleCheckout}
                disabled={isLoading || createCheckoutMutation.isPending}
                className="w-full h-13 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base rounded-xl"
              >
                {isLoading || createCheckoutMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Opening Stripe...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Add Payment Method
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full text-white/30 hover:text-white/60 text-sm transition-colors py-2"
              >
                Skip for now — I'll add my card later
              </button>

              <div className="flex items-center justify-center gap-4 text-white/30 text-xs pt-2">
                <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> SSL Secured</div>
                <div className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Powered by Stripe</div>
                <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Cancel anytime</div>
              </div>
            </div>
          </div>

          {/* Test card hint */}
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-300 text-xs text-center">
              <strong>Test mode:</strong> Use card <code className="bg-blue-500/20 px-1 rounded">4242 4242 4242 4242</code> with any future expiry and any CVC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
