/**
 * GHL Onboarding Wizard — PT-BR
 * Fluxo: Boas-vindas → Dados da empresa → Localização → Tipo de negócio → Token GHL → Criar sub-conta
 */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, Globe, Phone, Briefcase, Key, Check,
  ArrowRight, ArrowLeft, Rocket, ExternalLink, AlertCircle,
  CheckCircle2, Zap, Loader2
} from "lucide-react";

// ─── Step schemas ─────────────────────────────────────────────────────────────
const step1Schema = z.object({
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  companyPhone: z.string().min(6, "Telefone é obrigatório"),
  companyWebsite: z.string().optional(),
});
const step2Schema = z.object({
  country: z.string().min(2, "Selecione um país"),
});
const step3Schema = z.object({
  businessType: z.string().min(1, "Selecione o tipo de negócio"),
  primaryObjective: z.string().min(1, "Selecione seu objetivo principal"),
});
const step4Schema = z.object({
  ghlToken: z.string().min(10, "Insira um token GHL válido"),
  ghlCompanyId: z.string().optional(),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;
type Step4 = z.infer<typeof step4Schema>;

// ─── Data ─────────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "BR", name: "Brasil" },
  { code: "US", name: "Estados Unidos" },
  { code: "MX", name: "México" },
  { code: "CO", name: "Colômbia" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Peru" },
  { code: "EC", name: "Equador" },
  { code: "PT", name: "Portugal" },
  { code: "ES", name: "Espanha" },
  { code: "PA", name: "Panamá" },
  { code: "DO", name: "República Dominicana" },
  { code: "GT", name: "Guatemala" },
  { code: "CA", name: "Canadá" },
  { code: "GB", name: "Reino Unido" },
];

const BUSINESS_TYPES = [
  { id: "services", label: "Serviços Profissionais", icon: "💼" },
  { id: "health", label: "Saúde & Bem-estar", icon: "🏥" },
  { id: "beauty", label: "Beleza & Estética", icon: "💄" },
  { id: "real_estate", label: "Imóveis", icon: "🏠" },
  { id: "insurance", label: "Seguros & Finanças", icon: "🛡️" },
  { id: "legal", label: "Jurídico & Contabilidade", icon: "⚖️" },
  { id: "education", label: "Educação & Coaching", icon: "🎓" },
  { id: "ecommerce", label: "E-commerce & Varejo", icon: "🛒" },
  { id: "agency", label: "Agência de Marketing", icon: "📣" },
  { id: "other", label: "Outro", icon: "🔧" },
];

const OBJECTIVES = [
  { id: "generate_leads", label: "Gerar mais leads" },
  { id: "convert_leads", label: "Converter leads em clientes" },
  { id: "retain_clients", label: "Reter clientes existentes" },
  { id: "automate_followup", label: "Automatizar follow-ups" },
  { id: "manage_team", label: "Gerenciar minha equipe de vendas" },
  { id: "scale_marketing", label: "Escalar campanhas de marketing" },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
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
                ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30"
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

// ─── Layout ───────────────────────────────────────────────────────────────────
function WizardLayout({
  step, total, title, subtitle, children,
}: {
  step: number; total: number; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
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

// ─── Step Buttons ─────────────────────────────────────────────────────────────
function StepButtons({ onBack, onNext, loading }: { onBack?: () => void; onNext?: () => void; loading?: boolean }) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <Button type="button" onClick={onBack} variant="outline"
          className="flex-1 h-11 border-white/10 text-white/60 hover:text-white hover:border-white/30 bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      )}
      <Button type={onNext ? "button" : "submit"} onClick={onNext} disabled={loading}
        className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl">
        {loading ? (
          <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</span>
        ) : (
          <span className="flex items-center gap-2">Continuar <ArrowRight className="w-4 h-4" /></span>
        )}
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GhlOnboarding() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const isPaid = params.get("paid") === "true";

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Step1 & Step2 & Step3 & Step4>>({});

  const updateMutation = trpc.authOwn.updateGhlOnboarding.useMutation();
  const provisionMutation = trpc.ghlProvisioning.triggerProvisioning.useMutation({
    onSuccess: () => {
      toast.success("🎉 Sua sub-conta GoHighLevel foi criada! Redirecionando...");
      setTimeout(() => navigate("/dashboard"), 2500);
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Falha ao criar sub-conta. Você pode tentar novamente nas Configurações.");
      navigate("/dashboard");
    },
  });

  const TOTAL_STEPS = 5;

  // ── Step 0: Boas-vindas ──────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          {/* Success badge if came from payment */}
          {isPaid && (
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 text-green-400 text-sm font-medium mb-6">
              <CheckCircle2 className="w-4 h-4" />
              Pagamento confirmado! Agora vamos configurar sua conta.
            </div>
          )}

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Bem-vindo ao GetSales4Now!</h1>
          <p className="text-white/60 text-lg mb-8 leading-relaxed">
            Vamos configurar sua conta em poucos passos. Criaremos sua sub-conta GoHighLevel e configuraremos tudo para o seu negócio.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: "🏢", label: "Dados da empresa" },
              { icon: "🌎", label: "Localização" },
              { icon: "🎯", label: "Tipo de negócio" },
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
            Vamos começar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-white/30 hover:text-white/50 text-sm transition-colors py-3 mt-2"
          >
            Pular por agora — configurar depois
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Dados da empresa ─────────────────────────────────────────────────
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
      <WizardLayout step={step} total={TOTAL_STEPS} title="Dados da Empresa" subtitle="Informações básicas do seu negócio">
        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2"><Building2 className="w-4 h-4" /> Nome da empresa *</Label>
            <Input {...register("companyName")} placeholder="Minha Empresa Ltda" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
            {errors.companyName && <p className="text-red-400 text-xs">{errors.companyName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2"><Phone className="w-4 h-4" /> Telefone comercial *</Label>
            <Input {...register("companyPhone")} placeholder="+55 (11) 99999-0000" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
            {errors.companyPhone && <p className="text-red-400 text-xs">{errors.companyPhone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> Site (opcional)</Label>
            <Input {...register("companyWebsite")} placeholder="https://suaempresa.com.br" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
          </div>

          <StepButtons onBack={() => setStep(0)} loading={updateMutation.isPending} />
        </form>
      </WizardLayout>
    );
  }

  // ── Step 2: Localização ──────────────────────────────────────────────────────
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
      <WizardLayout step={step} total={TOTAL_STEPS} title="Localização" subtitle="Onde seu negócio opera?">
        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> País *</Label>
            <select
              {...register("country")}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-11 px-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
            >
              <option value="" className="bg-[#0d1526]">Selecione seu país</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#0d1526]">{c.name}</option>
              ))}
            </select>
            {errors.country && <p className="text-red-400 text-xs">{errors.country.message}</p>}
          </div>

          <StepButtons onBack={() => setStep(1)} loading={updateMutation.isPending} />
        </form>
      </WizardLayout>
    );
  }

  // ── Step 3: Tipo de negócio ──────────────────────────────────────────────────
  if (step === 3) {
    const [selectedType, setSelectedType] = useState(formData.businessType ?? "");
    const [selectedObj, setSelectedObj] = useState(formData.primaryObjective ?? "");

    const onNext = async () => {
      if (!selectedType || !selectedObj) {
        toast.error("Selecione o tipo de negócio e o objetivo principal.");
        return;
      }
      setFormData((prev) => ({ ...prev, businessType: selectedType, primaryObjective: selectedObj }));
      await updateMutation.mutateAsync({ step: 3, data: { businessType: selectedType } });
      setStep(4);
    };

    return (
      <WizardLayout step={step} total={TOTAL_STEPS} title="Perfil do Negócio" subtitle="Ajuda-nos a personalizar sua experiência">
        <div className="space-y-6">
          <div>
            <Label className="text-white/70 text-sm flex items-center gap-2 mb-3"><Briefcase className="w-4 h-4" /> Tipo de negócio *</Label>
            <div className="grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map((bt) => (
                <button key={bt.id} type="button" onClick={() => setSelectedType(bt.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                    selectedType === bt.id
                      ? "border-orange-500 bg-orange-500/10 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                  }`}>
                  <span className="text-lg">{bt.icon}</span>
                  <span className="text-sm font-medium">{bt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white/70 text-sm flex items-center gap-2 mb-3">🎯 Objetivo principal *</Label>
            <div className="space-y-2">
              {OBJECTIVES.map((obj) => (
                <button key={obj.id} type="button" onClick={() => setSelectedObj(obj.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selectedObj === obj.id
                      ? "border-orange-500 bg-orange-500/10 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                  }`}>
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
      </WizardLayout>
    );
  }

  // ── Step 4: Token GHL ────────────────────────────────────────────────────────
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
      <WizardLayout step={step} total={TOTAL_STEPS} title="Conectar GoHighLevel" subtitle="Vincule sua conta GHL para criar a sub-conta">
        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-sm font-semibold mb-2">Como obter seu Token GHL:</p>
                <ol className="text-blue-200/70 text-xs space-y-1">
                  <li>1. Acesse <a href="https://app.gohighlevel.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">GoHighLevel <ExternalLink className="w-3 h-3" /></a></li>
                  <li>2. Vá em <strong>Configurações → Integrações Privadas</strong></li>
                  <li>3. Clique em <strong>Criar nova integração</strong></li>
                  <li>4. Nomeie como "GetSales4Now" e selecione os escopos necessários</li>
                  <li>5. Copie o token gerado e cole abaixo</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2"><Key className="w-4 h-4" /> Token de Integração Privada GHL *</Label>
            <Input
              {...register("ghlToken")}
              type="password"
              placeholder="Cole seu token GHL aqui"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11 font-mono text-sm"
            />
            {errors.ghlToken && <p className="text-red-400 text-xs">{errors.ghlToken.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">ID da Empresa GHL (opcional)</Label>
            <Input
              {...register("ghlCompanyId")}
              placeholder="ID da sua agência/empresa no GHL"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11"
            />
            <p className="text-white/30 text-xs">Encontrado em GHL → Configurações → Empresa → ID da Empresa</p>
          </div>

          <StepButtons onBack={() => setStep(3)} loading={updateMutation.isPending} />
        </form>
      </WizardLayout>
    );
  }

  // ── Step 5: Confirmar e criar sub-conta ──────────────────────────────────────
  if (step === 5) {
    const handleProvision = () => {
      provisionMutation.mutate({
        businessName: formData.companyName ?? "Minha Empresa",
        businessEmail: "",
        businessPhone: formData.companyPhone ?? "",
        country: (formData.country ?? "BR").slice(0, 2),
        ghlToken: formData.ghlToken ?? "",
        ghlCompanyId: formData.ghlCompanyId ?? "",
      });
    };

    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="bg-[#0d1526] border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Pronto para lançar!</h2>
              <p className="text-white/50 text-sm">Revise suas informações e crie sua sub-conta GHL</p>
            </div>

            <div className="space-y-3 mb-8">
              {[
                { label: "Empresa", value: formData.companyName },
                { label: "Telefone", value: formData.companyPhone },
                { label: "País", value: COUNTRIES.find((c) => c.code === formData.country)?.name ?? formData.country },
                { label: "Tipo de negócio", value: BUSINESS_TYPES.find((b) => b.id === formData.businessType)?.label },
                { label: "Token GHL", value: formData.ghlToken ? "••••••••" + formData.ghlToken.slice(-4) : "Não informado" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 text-sm">{item.label}</span>
                  <span className="text-white text-sm font-medium">{item.value ?? "—"}</span>
                </div>
              ))}
            </div>

            {/* What happens */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
              <p className="text-orange-300 text-xs font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> O que acontece agora:
              </p>
              <ul className="text-orange-200/70 text-xs space-y-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-400" /> Criamos sua sub-conta no GoHighLevel</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-400" /> Configuramos seu usuário administrador</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-400" /> Você é redirecionado para o dashboard</li>
              </ul>
            </div>

            <Button
              onClick={handleProvision}
              disabled={provisionMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base rounded-xl"
            >
              {provisionMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando sub-conta...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Criar Minha Sub-Conta GHL
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full text-white/30 hover:text-white/50 text-sm transition-colors py-3"
            >
              Pular — configurar GHL depois
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
