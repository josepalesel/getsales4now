import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Building2,
  Target,
  MessageSquare,
  Mic,
  Users,
  Rocket,
  Check,
} from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030051896/YU6nqmaEyUsACHGWVz8xRF/GetSales4Now_logo_transparent_a2f08e10.jpg";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "DO", name: "Rep. Dominicana", flag: "🇩🇴" },
  { code: "OTHER", name: "Other", flag: "🌎" },
];

const CHANNELS = [
  { id: "whatsapp", icon: "💬", label: "WhatsApp" },
  { id: "email", icon: "📧", label: "Email" },
  { id: "sms", icon: "📱", label: "SMS" },
  { id: "instagram", icon: "📸", label: "Instagram" },
  { id: "facebook", icon: "👍", label: "Facebook" },
  { id: "linkedin", icon: "💼", label: "LinkedIn" },
  { id: "phone", icon: "📞", label: "Phone / Voice" },
  { id: "webchat", icon: "🌐", label: "Web Chat" },
];

interface OnboardingData {
  language: Language;
  country: string;
  businessType: string;
  businessName: string;
  primaryObjective: string;
  channels: string[];
  brandVoice: string;
  targetAudience: string;
}

const TOTAL_STEPS = 8;

export default function Onboarding() {
  const { language, setLanguage, t } = useLanguage();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    language: language,
    country: "",
    businessType: "",
    businessName: "",
    primaryObjective: "",
    channels: [],
    brandVoice: "",
    targetAudience: "",
  });

  const updateOnboarding = trpc.onboarding.complete.useMutation({
    onSuccess: () => {
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Failed to save onboarding. Please try again.");
    },
  });

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const canProceed = () => {
    switch (step) {
      case 1: return !!data.language;
      case 2: return !!data.country;
      case 3: return !!data.businessType && !!data.businessName;
      case 4: return !!data.primaryObjective;
      case 5: return data.channels.length > 0;
      case 6: return !!data.brandVoice;
      case 7: return !!data.targetAudience;
      case 8: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      updateOnboarding.mutate(data);
    }
  };

  const toggleChannel = (id: string) => {
    setData((d) => ({
      ...d,
      channels: d.channels.includes(id)
        ? d.channels.filter((c) => c !== id)
        : [...d.channels, id],
    }));
  };

  const businessTypes = Object.entries({
    services: t("onboarding.businessTypes.services"),
    health: t("onboarding.businessTypes.health"),
    beauty: t("onboarding.businessTypes.beauty"),
    realestate: t("onboarding.businessTypes.realestate"),
    insurance: t("onboarding.businessTypes.insurance"),
    legal: t("onboarding.businessTypes.legal"),
    accounting: t("onboarding.businessTypes.accounting"),
    other: t("onboarding.businessTypes.other"),
  });

  const objectives = Object.entries({
    leads: t("onboarding.objectives.leads"),
    sales: t("onboarding.objectives.sales"),
    retention: t("onboarding.objectives.retention"),
    brand: t("onboarding.objectives.brand"),
    automation: t("onboarding.objectives.automation"),
  });

  const brandVoices = Object.entries({
    professional: t("onboarding.brandVoice.professional"),
    friendly: t("onboarding.brandVoice.friendly"),
    energetic: t("onboarding.brandVoice.energetic"),
    empathetic: t("onboarding.brandVoice.empathetic"),
    authoritative: t("onboarding.brandVoice.authoritative"),
  });

  const stepInfo = [
    { icon: Globe, key: "step1" },
    { icon: Globe, key: "step2" },
    { icon: Building2, key: "step3" },
    { icon: Target, key: "step4" },
    { icon: MessageSquare, key: "step5" },
    { icon: Mic, key: "step6" },
    { icon: Users, key: "step7" },
    { icon: Rocket, key: "step8" },
  ];

  const currentStep = stepInfo[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-red-50 dark:from-orange-950/10 dark:via-background dark:to-red-950/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={LOGO_URL} alt="GetSales4Now" className="w-10 h-10 rounded-xl object-cover" />
          <span className="font-bold text-lg brand-gradient-text">GetSales4Now</span>
        </div>

        {/* Progress */}
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("onboarding.title")}</span>
            <span>{step} / {TOTAL_STEPS}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-1 rounded-full transition-all duration-300",
                  i < step ? "bg-primary" : "bg-border"
                )}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">
          {/* Step header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center flex-shrink-0">
              <StepIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t(`onboarding.${currentStep.key}.title`)}</h2>
              <p className="text-muted-foreground text-sm mt-1">{t(`onboarding.${currentStep.key}.subtitle`)}</p>
            </div>
          </div>

          {/* Step content */}
          <div className="space-y-4">
            {/* Step 1: Language */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setData((d) => ({ ...d, language: lang.code }));
                      setLanguage(lang.code);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer",
                      data.language === lang.code
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-3xl">{lang.flag}</span>
                    <span className="font-semibold text-sm">{lang.nativeName}</span>
                    {data.language === lang.code && (
                      <Badge className="brand-gradient text-white border-0 text-xs">Selected</Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Country */}
            {step === 2 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => setData((d) => ({ ...d, country: country.code }))}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all cursor-pointer",
                      data.country === country.code
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-sm font-medium truncate">{country.name}</span>
                    {data.country === country.code && (
                      <Check className="w-4 h-4 text-primary ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Business type */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "pt" ? "Nome do seu negócio" : language === "es" ? "Nombre de tu negocio" : "Business name"}
                  </label>
                  <Input
                    placeholder={language === "pt" ? "Ex: Clínica Saúde Total" : language === "es" ? "Ej: Clínica Salud Total" : "e.g. Total Health Clinic"}
                    value={data.businessName}
                    onChange={(e) => setData((d) => ({ ...d, businessName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {businessTypes.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setData((d) => ({ ...d, businessType: key }))}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left text-sm transition-all cursor-pointer",
                        data.businessType === key
                          ? "border-primary bg-primary/5 font-semibold"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      {data.businessType === key && <Check className="w-3.5 h-3.5 text-primary inline mr-1.5" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Objective */}
            {step === 4 && (
              <div className="space-y-2">
                {objectives.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setData((d) => ({ ...d, primaryObjective: key }))}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer",
                      data.primaryObjective === key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      data.primaryObjective === key ? "border-primary bg-primary" : "border-muted-foreground"
                    )}>
                      {data.primaryObjective === key && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 5: Channels */}
            {step === 5 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CHANNELS.map((channel) => {
                  const selected = data.channels.includes(channel.id);
                  return (
                    <button
                      key={channel.id}
                      onClick={() => toggleChannel(channel.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer relative",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      {selected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-2xl">{channel.icon}</span>
                      <span className="text-xs font-medium text-center">{channel.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 6: Brand voice */}
            {step === 6 && (
              <div className="space-y-2">
                {brandVoices.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setData((d) => ({ ...d, brandVoice: key }))}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer",
                      data.brandVoice === key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      data.brandVoice === key ? "border-primary bg-primary" : "border-muted-foreground"
                    )}>
                      {data.brandVoice === key && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 7: Target audience */}
            {step === 7 && (
              <div className="space-y-3">
                <Textarea
                  placeholder={
                    language === "pt"
                      ? "Ex: Mulheres de 25-45 anos, interessadas em saúde e bem-estar, na região de São Paulo..."
                      : language === "es"
                      ? "Ej: Mujeres de 25-45 años, interesadas en salud y bienestar, en la Ciudad de México..."
                      : "e.g. Women aged 25-45, interested in health and wellness, in the Miami area..."
                  }
                  value={data.targetAudience}
                  onChange={(e) => setData((d) => ({ ...d, targetAudience: e.target.value }))}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {language === "pt"
                    ? "Quanto mais detalhado, melhor a IA pode ajudar você."
                    : language === "es"
                    ? "Cuanto más detallado, mejor puede ayudarte la IA."
                    : "The more detailed, the better the AI can help you."}
                </p>
              </div>
            )}

            {/* Step 8: Complete */}
            {step === 8 && (
              <div className="text-center space-y-6 py-4">
                <div className="w-20 h-20 rounded-full brand-gradient flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {language === "pt" ? "Sua conta está configurada!" : language === "es" ? "¡Tu cuenta está configurada!" : "Your account is set up!"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === "pt"
                      ? "Vamos ao seu painel para começar a gerar resultados."
                      : language === "es"
                      ? "Vamos a tu panel para empezar a generar resultados."
                      : "Let's go to your dashboard to start generating results."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  {[
                    { icon: "✅", text: language === "pt" ? "CRM configurado" : language === "es" ? "CRM configurado" : "CRM configured" },
                    { icon: "✅", text: language === "pt" ? "Templates prontos" : language === "es" ? "Plantillas listas" : "Templates ready" },
                    { icon: "✅", text: language === "pt" ? "IA ativada" : language === "es" ? "IA activada" : "AI activated" },
                    { icon: "✅", text: language === "pt" ? "Idioma configurado" : language === "es" ? "Idioma configurado" : "Language set" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-sm">
                      <span>{icon}</span>
                      <span className="text-muted-foreground">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("common.back")}
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || updateOnboarding.isPending}
              className="brand-gradient text-white border-0 gap-2"
            >
              {step === TOTAL_STEPS
                ? (updateOnboarding.isPending ? t("common.loading") : t("common.finish"))
                : t("common.next")}
              {step < TOTAL_STEPS && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
