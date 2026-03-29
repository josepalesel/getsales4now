import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, Globe, Phone, Briefcase, Key, Check,
  ArrowRight, ArrowLeft, Rocket, ExternalLink, AlertCircle
} from "lucide-react";

// ─── Step schemas ─────────────────────────────────────────────────────────────
const step1Schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companyPhone: z.string().min(6, "Phone number is required"),
  companyWebsite: z.string().optional(),
});

const step2Schema = z.object({
  country: z.string().min(2, "Please select a country"),
  timezone: z.string().optional(),
});

const step3Schema = z.object({
  businessType: z.string().min(1, "Please select a business type"),
  primaryObjective: z.string().min(1, "Please select your primary goal"),
});

const step4Schema = z.object({
  ghlToken: z.string().min(10, "Please enter a valid GoHighLevel API token"),
  ghlCompanyId: z.string().optional(),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;
type Step4 = z.infer<typeof step4Schema>;

// ─── Data ─────────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "CO", name: "Colombia" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Peru" },
  { code: "EC", name: "Ecuador" },
  { code: "VE", name: "Venezuela" },
  { code: "GT", name: "Guatemala" },
  { code: "PA", name: "Panama" },
  { code: "DO", name: "Dominican Republic" },
  { code: "PT", name: "Portugal" },
  { code: "ES", name: "Spain" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
];

const BUSINESS_TYPES = [
  { id: "services", label: "Professional Services", icon: "💼" },
  { id: "health", label: "Health & Wellness", icon: "🏥" },
  { id: "beauty", label: "Beauty & Aesthetics", icon: "💄" },
  { id: "real_estate", label: "Real Estate", icon: "🏠" },
  { id: "insurance", label: "Insurance & Finance", icon: "🛡️" },
  { id: "legal", label: "Legal & Accounting", icon: "⚖️" },
  { id: "education", label: "Education & Coaching", icon: "🎓" },
  { id: "ecommerce", label: "E-commerce & Retail", icon: "🛒" },
  { id: "agency", label: "Marketing Agency", icon: "📣" },
  { id: "other", label: "Other", icon: "🔧" },
];

const OBJECTIVES = [
  { id: "generate_leads", label: "Generate more leads" },
  { id: "convert_leads", label: "Convert leads into clients" },
  { id: "retain_clients", label: "Retain existing clients" },
  { id: "automate_followup", label: "Automate follow-ups" },
  { id: "manage_team", label: "Manage my sales team" },
  { id: "scale_marketing", label: "Scale marketing campaigns" },
];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < current
                ? "bg-green-500 text-white"
                : i === current
                ? "bg-gradient-to-br from-orange-500 to-red-600 text-white"
                : "bg-white/10 text-white/30"
            }`}
          >
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-8 rounded-full transition-all ${i < current ? "bg-green-500" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GhlOnboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Step1 & Step2 & Step3 & Step4>>({});

  const updateMutation = trpc.authOwn.updateGhlOnboarding.useMutation();
  const provisionMutation = trpc.ghlProvisioning.triggerProvisioning.useMutation({
    onSuccess: () => {
      toast.success("🎉 Your GoHighLevel sub-account is being created! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 2000);
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Failed to create sub-account. You can retry from Settings.");
      navigate("/dashboard");
    },
  });

  const TOTAL_STEPS = 5;

  // ── Step 0: Welcome ─────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to GetSales4Now!</h1>
          <p className="text-white/60 text-lg mb-8 leading-relaxed">
            Let's set up your account in just a few steps. We'll create your GoHighLevel sub-account and configure everything for your business.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: "🏢", label: "Company Info" },
              { icon: "🌎", label: "Location" },
              { icon: "🎯", label: "Business Type" },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-white/60 text-sm">{item.label}</div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setStep(1)}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base rounded-xl"
          >
            Let's Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 1: Company Info ────────────────────────────────────────────────────
  if (step === 1) {
    const { register, handleSubmit, formState: { errors } } = useForm<Step1>({
      resolver: zodResolver(step1Schema),
      defaultValues: { companyName: formData.companyName, companyPhone: formData.companyPhone, companyWebsite: formData.companyWebsite },
    });

    const onNext = async (data: Step1) => {
      setFormData((prev) => ({ ...prev, ...data }));
      await updateMutation.mutateAsync({ step: 1, data: { companyName: data.companyName, companyPhone: data.companyPhone, companyWebsite: data.companyWebsite } });
      setStep(2);
    };

    return (
      <OnboardingLayout step={step} total={TOTAL_STEPS} title="Company Information" subtitle="Tell us about your business">
        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2"><Building2 className="w-4 h-4" /> Company Name *</Label>
            <Input {...register("companyName")} placeholder="Acme Marketing Agency" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
            {errors.companyName && <p className="text-red-400 text-xs">{errors.companyName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2"><Phone className="w-4 h-4" /> Business Phone *</Label>
            <Input {...register("companyPhone")} placeholder="+1 (555) 000-0000" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
            {errors.companyPhone && <p className="text-red-400 text-xs">{errors.companyPhone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> Website (optional)</Label>
            <Input {...register("companyWebsite")} placeholder="https://yourcompany.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
          </div>

          <StepButtons onBack={() => setStep(0)} loading={updateMutation.isPending} />
        </form>
      </OnboardingLayout>
    );
  }

  // ── Step 2: Location ────────────────────────────────────────────────────────
  if (step === 2) {
    const { register, handleSubmit, formState: { errors } } = useForm<Step2>({
      resolver: zodResolver(step2Schema),
      defaultValues: { country: formData.country },
    });

    const onNext = async (data: Step2) => {
      setFormData((prev) => ({ ...prev, ...data }));
      await updateMutation.mutateAsync({ step: 2, data: { country: data.country } });
      setStep(3);
    };

    return (
      <OnboardingLayout step={step} total={TOTAL_STEPS} title="Location & Market" subtitle="Where does your business operate?">
        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> Country *</Label>
            <select
              {...register("country")}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-11 px-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
            >
              <option value="" className="bg-[#0d1526]">Select your country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#0d1526]">{c.name}</option>
              ))}
            </select>
            {errors.country && <p className="text-red-400 text-xs">{errors.country.message}</p>}
          </div>

          <StepButtons onBack={() => setStep(1)} loading={updateMutation.isPending} />
        </form>
      </OnboardingLayout>
    );
  }

  // ── Step 3: Business Type ───────────────────────────────────────────────────
  if (step === 3) {
    const [selectedType, setSelectedType] = useState(formData.businessType ?? "");
    const [selectedObj, setSelectedObj] = useState(formData.primaryObjective ?? "");

    const onNext = async () => {
      if (!selectedType || !selectedObj) {
        toast.error("Please select both business type and primary goal.");
        return;
      }
      setFormData((prev) => ({ ...prev, businessType: selectedType, primaryObjective: selectedObj }));
      await updateMutation.mutateAsync({ step: 3, data: { businessType: selectedType } });
      setStep(4);
    };

    return (
      <OnboardingLayout step={step} total={TOTAL_STEPS} title="Business Profile" subtitle="Help us personalize your experience">
        <div className="space-y-6">
          <div>
            <Label className="text-white/70 text-sm flex items-center gap-2 mb-3"><Briefcase className="w-4 h-4" /> Business Type *</Label>
            <div className="grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map((bt) => (
                <button
                  key={bt.id}
                  type="button"
                  onClick={() => setSelectedType(bt.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                    selectedType === bt.id
                      ? "border-orange-500 bg-orange-500/10 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                  }`}
                >
                  <span className="text-lg">{bt.icon}</span>
                  <span className="text-sm font-medium">{bt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white/70 text-sm flex items-center gap-2 mb-3">🎯 Primary Goal *</Label>
            <div className="space-y-2">
              {OBJECTIVES.map((obj) => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => setSelectedObj(obj.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selectedObj === obj.id
                      ? "border-orange-500 bg-orange-500/10 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedObj === obj.id ? "border-orange-500 bg-orange-500" : "border-white/30"}`}>
                    {selectedObj === obj.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm">{obj.label}</span>
                </button>
              ))}
            </div>
          </div>

          <StepButtons onBack={() => setStep(2)} onNext={onNext} loading={updateMutation.isPending} />
        </div>
      </OnboardingLayout>
    );
  }

  // ── Step 4: GHL Token ───────────────────────────────────────────────────────
  if (step === 4) {
    const { register, handleSubmit, formState: { errors } } = useForm<Step4>({
      resolver: zodResolver(step4Schema),
      defaultValues: { ghlToken: formData.ghlToken },
    });

    const onNext = async (data: Step4) => {
      setFormData((prev) => ({ ...prev, ...data }));
      await updateMutation.mutateAsync({ step: 4, data: { ghlToken: data.ghlToken, ghlCompanyId: data.ghlCompanyId }, completed: true });
      setStep(5);
    };

    return (
      <OnboardingLayout step={step} total={TOTAL_STEPS} title="Connect GoHighLevel" subtitle="Link your GHL account to create your sub-account">
        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-sm font-semibold mb-2">How to get your GHL API Token:</p>
                <ol className="text-blue-200/70 text-xs space-y-1">
                  <li>1. Log in to <a href="https://app.gohighlevel.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">GoHighLevel <ExternalLink className="w-3 h-3" /></a></li>
                  <li>2. Go to <strong>Settings → Private Integrations</strong></li>
                  <li>3. Click <strong>Create new Integration</strong></li>
                  <li>4. Name it "GetSales4Now" and select the required scopes</li>
                  <li>5. Copy the generated token and paste it below</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2"><Key className="w-4 h-4" /> GHL Private Integration Token *</Label>
            <Input
              {...register("ghlToken")}
              type="password"
              placeholder="Paste your GHL token here"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11 font-mono text-sm"
            />
            {errors.ghlToken && <p className="text-red-400 text-xs">{errors.ghlToken.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">GHL Company ID (optional)</Label>
            <Input
              {...register("ghlCompanyId")}
              placeholder="Your GHL Agency/Company ID"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11"
            />
            <p className="text-white/30 text-xs">Found in GHL → Settings → Company → Company ID</p>
          </div>

          <StepButtons onBack={() => setStep(3)} loading={updateMutation.isPending} />
        </form>
      </OnboardingLayout>
    );
  }

  // ── Step 5: Confirm & Provision ─────────────────────────────────────────────
  if (step === 5) {
    const handleProvision = () => {
      provisionMutation.mutate({
        businessName: formData.companyName ?? "My Company",
        businessEmail: "",
        businessPhone: formData.companyPhone ?? "",
        country: (formData.country ?? "US").slice(0, 2),
        ghlToken: formData.ghlToken ?? "",
        ghlCompanyId: formData.ghlCompanyId ?? "",
      });
    };

    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="bg-[#0d1526] border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to launch!</h2>
              <p className="text-white/50 text-sm">Review your information and create your sub-account</p>
            </div>

            <div className="space-y-3 mb-8">
              {[
                { label: "Company", value: formData.companyName },
                { label: "Phone", value: formData.companyPhone },
                { label: "Country", value: COUNTRIES.find((c) => c.code === formData.country)?.name ?? formData.country },
                { label: "Business Type", value: BUSINESS_TYPES.find((b) => b.id === formData.businessType)?.label },
                { label: "GHL Token", value: formData.ghlToken ? "••••••••" + formData.ghlToken.slice(-4) : "Not provided" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 text-sm">{item.label}</span>
                  <span className="text-white text-sm font-medium">{item.value ?? "—"}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleProvision}
              disabled={provisionMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base rounded-xl"
            >
              {provisionMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating sub-account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create My Sub-Account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full text-white/30 hover:text-white/50 text-sm transition-colors py-3"
            >
              Skip — I'll set up GHL later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Layout helper ────────────────────────────────────────────────────────────
function OnboardingLayout({
  step, total, title, subtitle, children,
}: {
  step: number; total: number; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">GS</div>
          <span className="text-white font-bold">GetSales4Now</span>
        </div>

        <StepIndicator current={step - 1} total={total - 1} />

        <div className="bg-[#0d1526] border border-white/10 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-white/50 text-sm mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function StepButtons({
  onBack, onNext, loading,
}: {
  onBack?: () => void; onNext?: () => void; loading?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="flex-1 h-11 border-white/10 text-white/60 hover:text-white hover:border-white/30 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}
      <Button
        type={onNext ? "button" : "submit"}
        onClick={onNext}
        disabled={loading}
        className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </Button>
    </div>
  );
}
