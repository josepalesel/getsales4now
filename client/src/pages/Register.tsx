import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Check, Zap, Building2, ArrowRight, Shield, Clock, CreditCard } from "lucide-react";

// ─── Validation ───────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  plan: z.enum(["starter", "business"]),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

// ─── Plan definitions ─────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    price: "$118",
    period: "/month",
    description: "Perfect for small businesses getting started with digital marketing",
    color: "from-orange-500 to-orange-600",
    borderColor: "border-orange-500",
    bgColor: "bg-orange-500/10",
    features: [
      "Up to 5,000 contacts",
      "3 team members",
      "Email & WhatsApp campaigns",
      "CRM with pipeline",
      "Social media calendar",
      "AI content generation",
      "Basic reports",
      "14-day free trial",
    ],
  },
  {
    id: "business" as const,
    name: "Business",
    price: "$398",
    period: "/month",
    description: "Full power for growing businesses and agencies",
    color: "from-red-500 to-red-600",
    borderColor: "border-red-500",
    bgColor: "bg-red-500/10",
    badge: "Most Popular",
    features: [
      "Unlimited contacts",
      "10 team members",
      "All channels (Email, WhatsApp, SMS)",
      "Advanced CRM + AI scoring",
      "Full funnel builder",
      "Omnichannel inbox",
      "AI copilots (6 agents)",
      "GoHighLevel sub-account",
      "White-label ready",
      "Priority support",
      "14-day free trial",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Register() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<"plan" | "form">("plan");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { plan: "starter" },
  });

  const selectedPlan = watch("plan");

  const registerMutation = trpc.authOwn.register.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome, ${data.name}! Your 14-day trial has started.`);
      // Redirect to checkout to add payment method
      navigate("/checkout?plan=" + data.plan + "&trial=true");
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed. Please try again.");
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  const handlePlanSelect = (planId: "starter" | "business") => {
    setValue("plan", planId);
    setStep("form");
  };

  // ── Step 1: Plan Selection ──────────────────────────────────────────────────
  if (step === "plan") {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">GS</div>
              <span className="text-white font-bold text-lg">GetSales4Now</span>
            </div>
          </Link>
          <span className="text-white/50 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">Sign in</Link>
          </span>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-4">
              <Clock className="w-4 h-4" />
              14-day free trial — no charge today
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Choose your plan</h1>
            <p className="text-white/60 text-lg">Start free for 14 days. Cancel anytime.</p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`relative text-left rounded-2xl border-2 p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl ${plan.borderColor} ${plan.bgColor} bg-[#0d1526]`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-white/50 text-sm mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-black bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                    {plan.price}
                  </span>
                  <span className="text-white/50 text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/80 text-sm">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className={`w-full py-3 rounded-xl font-semibold text-white text-center bg-gradient-to-r ${plan.color} flex items-center justify-center gap-2`}>
                  Start {plan.name} Trial
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/40 text-sm">
            <div className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> SSL Secured</div>
            <div className="flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> No charge for 14 days</div>
            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Cancel anytime</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Registration Form ───────────────────────────────────────────────
  const currentPlan = PLANS.find((p) => p.id === selectedPlan)!;

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">GS</div>
            <span className="text-white font-bold text-lg">GetSales4Now</span>
          </div>
        </Link>
        <span className="text-white/50 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">Sign in</Link>
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Plan badge */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setStep("plan")}
              className="text-white/50 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              ← Change plan
            </button>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${currentPlan.borderColor} ${currentPlan.bgColor}`}>
              {selectedPlan === "starter" ? <Zap className="w-3.5 h-3.5 text-orange-400" /> : <Building2 className="w-3.5 h-3.5 text-red-400" />}
              <span className="text-white text-xs font-semibold">{currentPlan.name} — {currentPlan.price}/mo</span>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-[#0d1526] border border-white/10 rounded-2xl p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Create your account</h1>
              <p className="text-white/50 text-sm mt-1">
                Start your 14-day free trial — no credit card charged today
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Full Name</Label>
                <Input
                  {...register("name")}
                  placeholder="John Smith"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 focus:ring-orange-500/20 h-11"
                />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Email Address</Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="john@company.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 focus:ring-orange-500/20 h-11"
                />
                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Password</Label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 focus:ring-orange-500/20 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    {...register("confirmPassword")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 focus:ring-orange-500/20 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base rounded-xl mt-2"
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              {/* Trial note */}
              <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3 mt-2">
                <Clock className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <p className="text-green-300 text-xs leading-relaxed">
                  <strong>14 days free.</strong> After registration, you'll add your credit card to secure your plan — but you won't be charged until your trial ends.
                </p>
              </div>

              {/* Terms */}
              <p className="text-white/30 text-xs text-center">
                By creating an account you agree to our{" "}
                <span className="text-orange-400 cursor-pointer hover:underline">Terms of Service</span>{" "}
                and{" "}
                <span className="text-orange-400 cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
