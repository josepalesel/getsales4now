import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle, ArrowRight, Zap, Users, BarChart3, MessageSquare, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Welcome() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  const { data: subscription } = trpc.billing.getSubscription.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    // Animate steps in
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 1300),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const planName = subscription?.plan === "business" ? "Business" : "Starter";
  const trialDays = 14;

  const features = [
    { icon: Users, label: "CRM & Pipeline", desc: "Manage contacts and track deals" },
    { icon: MessageSquare, label: "Omnichannel Inbox", desc: "WhatsApp, Email, SMS unified" },
    { icon: Zap, label: "AI Copilots", desc: "6 intelligent agents working for you" },
    { icon: BarChart3, label: "Smart Reports", desc: "Actionable insights in plain language" },
  ];

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Success icon */}
        <div
          className="flex justify-center mb-6 transition-all duration-700"
          style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? "scale(1)" : "scale(0.5)" }}
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/40">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div
          className="transition-all duration-700 delay-300"
          style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? "translateY(0)" : "translateY(20px)" }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to GetSales4Now!
          </h1>
          <p className="text-xl text-orange-400 font-semibold mb-1">
            {planName} Plan — {trialDays}-Day Free Trial Active
          </p>
          <p className="text-gray-400 text-base">
            {user?.name ? `Hi ${user.name}!` : "Hi there!"} Your account is ready. No charge for {trialDays} days.
          </p>
        </div>

        {/* Trial badge */}
        <div
          className="mt-6 mb-8 transition-all duration-700 delay-500"
          style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? "translateY(0)" : "translateY(20px)" }}
        >
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-5 py-2.5">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">
              Trial ends in {trialDays} days — you won't be charged until then
            </span>
          </div>
        </div>

        {/* Features grid */}
        <div
          className="grid grid-cols-2 gap-3 mb-8 transition-all duration-700 delay-700"
          style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? "translateY(0)" : "translateY(20px)" }}
        >
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:bg-white/8 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-white text-sm font-semibold">{label}</span>
              </div>
              <p className="text-gray-500 text-xs">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center transition-all duration-700 delay-1000"
          style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? "translateY(0)" : "translateY(20px)" }}
        >
          <Button
            onClick={() => navigate("/ghl-onboarding")}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-8 py-3 text-base rounded-xl shadow-lg shadow-orange-500/30 flex items-center gap-2"
          >
            Set Up Your Account
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-base rounded-xl"
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Bottom note */}
        <p className="mt-6 text-gray-600 text-xs">
          Need help? Check our{" "}
          <Link href="/integrations" className="text-orange-400 hover:underline">
            Integration Guide
          </Link>{" "}
          or contact support anytime.
        </p>
      </div>
    </div>
  );
}
