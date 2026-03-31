import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Shield, TrendingUp } from "lucide-react";

// ─── Validation ───────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Login() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const returnTo = new URLSearchParams(search).get("returnTo");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot" | "forgot-sent">("login");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const loginMutation = trpc.authOwn.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data.name}!`);
      // Se há returnTo na URL (ex: vindo de /ghl-onboarding?paid=true), usar ele
      if (returnTo) {
        navigate(decodeURIComponent(returnTo));
      } else if (data.needsGhlOnboarding) {
        navigate("/ghl-onboarding");
      } else if (data.needsCheckout) {
        navigate("/checkout?plan=" + data.plan + "&trial=true");
      } else {
        navigate("/dashboard");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Invalid email or password.");
    },
  });

  const forgotMutation = trpc.authOwn.forgotPassword.useMutation({
    onSuccess: () => {
      setMode("forgot-sent");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send reset email.");
    },
  });

  const onLogin = (data: LoginForm) => loginMutation.mutate(data);
  const onForgot = (data: ForgotForm) => forgotMutation.mutate(data);

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-[#0d1526] to-[#0a0f1e] border-r border-white/5 p-12">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">GS</div>
            <div>
              <div className="text-white font-bold text-lg leading-none">GetSales4Now</div>
              <div className="text-white/40 text-xs">Digital Marketing & Sales Automation</div>
            </div>
          </div>
        </Link>

        <div className="space-y-8">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Grow your business<br />with AI-powered tools
            </h2>
            <p className="text-white/50 text-base leading-relaxed">
              CRM, campaigns, social media, funnels, and omnichannel inbox — all in one platform. Available in English, Spanish, and Portuguese.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Active Users", value: "2,400+" },
              { label: "Campaigns Sent", value: "180K+" },
              { label: "Avg. Response Time", value: "< 2 min" },
              { label: "Countries", value: "12" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-400">{stat.value}</div>
                <div className="text-white/40 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/30 text-xs">
          <Shield className="w-3.5 h-3.5" />
          SSL encrypted · LGPD/GDPR compliant
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">GS</div>
            <span className="text-white font-bold text-lg">GetSales4Now</span>
          </div>

          {/* ── Login Form ── */}
          {mode === "login" && (
            <div className="bg-[#0d1526] border border-white/10 rounded-2xl p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Sign in</h1>
                <p className="text-white/50 text-sm mt-1">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Email Address</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="john@company.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11"
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70 text-sm">Password</Label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-orange-400 hover:text-orange-300 text-xs transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11 pr-10"
                      autoComplete="current-password"
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

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base rounded-xl"
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-white/40 text-sm">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-orange-400 hover:text-orange-300 font-medium">
                    Start free trial
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ── Forgot Password Form ── */}
          {mode === "forgot" && (
            <div className="bg-[#0d1526] border border-white/10 rounded-2xl p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Reset password</h1>
                <p className="text-white/50 text-sm mt-1">
                  Enter your email and we'll send a reset link
                </p>
              </div>

              <form onSubmit={handleForgotSubmit(onForgot)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Email Address</Label>
                  <Input
                    {...registerForgot("email")}
                    type="email"
                    placeholder="john@company.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11"
                  />
                  {forgotErrors.email && <p className="text-red-400 text-xs">{forgotErrors.email.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={forgotMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl"
                >
                  {forgotMutation.isPending ? "Sending..." : "Send Reset Link"}
                </Button>

                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="w-full text-white/40 hover:text-white/70 text-sm transition-colors"
                >
                  ← Back to sign in
                </button>
              </form>
            </div>
          )}

          {/* ── Forgot Sent Confirmation ── */}
          {mode === "forgot-sent" && (
            <div className="bg-[#0d1526] border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-white/50 text-sm mb-6">
                If an account exists with that email, you'll receive a password reset link shortly.
              </p>
              <Button
                onClick={() => setMode("login")}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl"
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
