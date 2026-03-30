/**
 * GetSales4Now — Onboarding Wizard (estilo GHL)
 * Arquitetura: cada step é um sub-componente independente com seus próprios hooks.
 * Isso resolve o bug "hooks inside conditionals" do React.
 *
 * Fluxo:
 *  0 → Boas-vindas
 *  1 → Dados da empresa
 *  2 → Endereço e localização
 *  3 → Segmento e objetivo
 *  4 → Canais de comunicação
 *  5 → Conectar GoHighLevel
 *  6 → Revisão e confirmação
 *  7 → Criando sub-conta (loading)
 */
import { useState } from "react";
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
  Building2, Globe, Phone, Mail, MapPin, Briefcase,
  Key, Check, ArrowRight, ArrowLeft, Rocket, ExternalLink,
  AlertCircle, CheckCircle2, Zap, Loader2, MessageSquare,
  Instagram, Facebook, AtSign, Smartphone, Users,
} from "lucide-react";

// ─── Confetti helper ─────────────────────────────────────────────────────────
function ConfettiPiece({ style }: { style: React.CSSProperties }) {
  return <div className="absolute w-2 h-2 rounded-sm animate-bounce" style={style} />;
}

function Confetti() {
  const pieces = Array.from({ length: 30 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 60}%`,
    background: ["#f97316","#ef4444","#22c55e","#3b82f6","#a855f7","#eab308"][i % 6],
    animationDelay: `${Math.random() * 1}s`,
    animationDuration: `${0.8 + Math.random() * 0.6}s`,
    transform: `rotate(${Math.random() * 360}deg)`,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((s, i) => <ConfettiPiece key={i} style={s} />)}
    </div>
  );
}

// ─── Shared data ──────────────────────────────────────────────────────────────
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
  { id: "restaurant", label: "Restaurante & Food", icon: "🍽️" },
  { id: "auto", label: "Automotivo", icon: "🚗" },
  { id: "other", label: "Outro", icon: "🔧" },
];

const OBJECTIVES = [
  { id: "generate_leads", label: "Gerar mais leads qualificados" },
  { id: "convert_leads", label: "Converter leads em clientes" },
  { id: "retain_clients", label: "Reter e fidelizar clientes" },
  { id: "automate_followup", label: "Automatizar follow-ups e nurturing" },
  { id: "manage_team", label: "Gerenciar equipe de vendas" },
  { id: "scale_marketing", label: "Escalar campanhas de marketing" },
];

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  { id: "email", label: "E-mail", icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { id: "sms", label: "SMS", icon: Smartphone, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/30" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-500", bg: "bg-blue-600/10", border: "border-blue-600/30" },
  { id: "telegram", label: "Telegram", icon: AtSign, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
];

// ─── Success screen ──────────────────────────────────────────────────────────
function StepSuccess({ companyName, onGo }: { companyName?: string; onGo: () => void }) {
  return (
    <>
      <Confetti />
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Sub-conta criada!</h2>
          <p className="text-white/60 text-base mb-2">
            <strong className="text-white">{companyName ?? "Sua empresa"}</strong> está configurada no GoHighLevel.
          </p>
          <p className="text-white/40 text-sm mb-8">Você já pode acessar o dashboard e começar a usar a plataforma.</p>
          <Button
            onClick={onGo}
            className="w-full max-w-xs h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base rounded-xl mx-auto"
          >
            Ir para o Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Shared types ─────────────────────────────────────────────────────────────
export interface WizardData {
  // Step 1
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  // Step 2
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  // Step 3
  businessType?: string;
  primaryObjective?: string;
  // Step 4
  channels?: string[];
  // Step 5
  ghlToken?: string;
  ghlCompanyId?: string;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total - 1)) * 100);
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-xs">Passo {step} de {total - 1}</span>
        <span className="text-orange-400 text-xs font-semibold">{pct}% concluído</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Step dots */}
      <div className="flex items-center justify-between mt-3">
        {Array.from({ length: total - 1 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i + 1 < step ? "bg-green-500" : i + 1 === step ? "bg-orange-500 scale-125" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Shell layout ─────────────────────────────────────────────────────────────
function WizardShell({
  step, totalSteps, title, subtitle, isPaid, children,
}: {
  step: number; totalSteps: number; title: string; subtitle: string; isPaid?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">GS</div>
            <span className="text-white font-bold text-lg">GetSales4Now</span>
          </div>
          {isPaid && (
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1 text-green-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pagamento confirmado
            </div>
          )}
        </div>

        {/* Progress */}
        {step > 0 && <ProgressBar step={step} total={totalSteps} />}

        {/* Card */}
        <div className="bg-[#0d1526] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {step > 0 && (
            <div className="px-8 pt-8 pb-0">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-white/50 text-sm mt-1">{subtitle}</p>
              <div className="mt-6 border-t border-white/5" />
            </div>
          )}
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Nav buttons ──────────────────────────────────────────────────────────────
function NavButtons({
  onBack, onNext, loading, nextLabel = "Continuar",
}: {
  onBack?: () => void; onNext?: () => void; loading?: boolean; nextLabel?: string;
}) {
  return (
    <div className="flex gap-3 pt-6 border-t border-white/5 mt-6">
      {onBack && (
        <Button type="button" onClick={onBack} variant="outline"
          className="h-11 px-6 border-white/10 text-white/60 hover:text-white hover:border-white/30 bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      )}
      <Button
        type={onNext ? "button" : "submit"}
        onClick={onNext}
        disabled={loading}
        className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl"
      >
        {loading ? (
          <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</span>
        ) : (
          <span className="flex items-center gap-2">{nextLabel} <ArrowRight className="w-4 h-4" /></span>
        )}
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP COMPONENTS — each has its own hooks at the top level
// ═══════════════════════════════════════════════════════════════════════════════

// ── Step 0: Welcome ───────────────────────────────────────────────────────────
function StepWelcome({ isPaid, onNext }: { isPaid: boolean; onNext: () => void }) {
  return (
    <WizardShell step={0} totalSteps={7} title="" subtitle="" isPaid={isPaid}>
      <div className="text-center py-4">
        {isPaid && (
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 text-green-400 text-sm font-medium mb-6">
            <CheckCircle2 className="w-4 h-4" /> Pagamento confirmado! Vamos configurar sua conta.
          </div>
        )}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30">
          <Rocket className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Bem-vindo ao GetSales4Now!</h1>
        <p className="text-white/60 text-base mb-8 leading-relaxed max-w-md mx-auto">
          Vamos configurar sua conta em <strong className="text-white">menos de 5 minutos</strong>. Criaremos sua sub-conta GoHighLevel e configuraremos tudo para o seu negócio começar a vender.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
          {[
            { icon: "🏢", label: "Dados da empresa", desc: "Nome, telefone, e-mail" },
            { icon: "📍", label: "Localização", desc: "País, cidade, CEP" },
            { icon: "🎯", label: "Segmento", desc: "Tipo e objetivo" },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-white text-xs font-semibold">{item.label}</div>
              <div className="text-white/40 text-xs mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>

        <Button
          onClick={onNext}
          className="w-full max-w-sm h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base rounded-xl mx-auto"
        >
          Vamos começar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-white/30 text-xs mt-3">Você pode editar essas informações depois nas configurações</p>
      </div>
    </WizardShell>
  );
}

// ── Step 1: Company Info ──────────────────────────────────────────────────────
const step1Schema = z.object({
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  companyEmail: z.string().email("E-mail inválido"),
  companyPhone: z.string().min(6, "Telefone é obrigatório"),
  companyWebsite: z.string().optional(),
});
type Step1Data = z.infer<typeof step1Schema>;

function StepCompanyInfo({
  isPaid, defaultValues, onBack, onNext, loading,
}: {
  isPaid: boolean;
  defaultValues: Partial<Step1Data>;
  onBack: () => void;
  onNext: (data: Step1Data) => void;
  loading: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });

  return (
    <WizardShell step={1} totalSteps={7} title="Dados da Empresa" subtitle="Informações básicas do seu negócio" isPaid={isPaid}>
      <form onSubmit={handleSubmit(onNext)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-white/70 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" /> Nome da empresa *
            </Label>
            <Input {...register("companyName")} placeholder="Minha Empresa Ltda"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
            {errors.companyName && <p className="text-red-400 text-xs">{errors.companyName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-400" /> E-mail comercial *
            </Label>
            <Input {...register("companyEmail")} type="email" placeholder="contato@empresa.com.br"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
            {errors.companyEmail && <p className="text-red-400 text-xs">{errors.companyEmail.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-400" /> Telefone comercial *
            </Label>
            <Input {...register("companyPhone")} placeholder="+55 (11) 99999-0000"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
            {errors.companyPhone && <p className="text-red-400 text-xs">{errors.companyPhone.message}</p>}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-white/70 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-400" /> Site (opcional)
            </Label>
            <Input {...register("companyWebsite")} placeholder="https://suaempresa.com.br"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
          </div>
        </div>
        <NavButtons onBack={onBack} loading={loading} />
      </form>
    </WizardShell>
  );
}

// ── Step 2: Location ──────────────────────────────────────────────────────────
const step2Schema = z.object({
  country: z.string().min(2, "Selecione um país"),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
});
type Step2Data = z.infer<typeof step2Schema>;

function StepLocation({
  isPaid, defaultValues, onBack, onNext, loading,
}: {
  isPaid: boolean;
  defaultValues: Partial<Step2Data>;
  onBack: () => void;
  onNext: (data: Step2Data) => void;
  loading: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues,
  });

  return (
    <WizardShell step={2} totalSteps={7} title="Localização" subtitle="Onde seu negócio opera?" isPaid={isPaid}>
      <form onSubmit={handleSubmit(onNext)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-white/70 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-400" /> País *
            </Label>
            <select {...register("country")}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-11 px-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/20">
              <option value="" className="bg-[#0d1526]">Selecione seu país</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#0d1526]">{c.name}</option>
              ))}
            </select>
            {errors.country && <p className="text-red-400 text-xs">{errors.country.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" /> Estado / Província
            </Label>
            <Input {...register("state")} placeholder="São Paulo"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" /> Cidade
            </Label>
            <Input {...register("city")} placeholder="São Paulo"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">CEP / Código Postal</Label>
            <Input {...register("zipCode")} placeholder="01310-100"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
          </div>
        </div>
        <NavButtons onBack={onBack} loading={loading} />
      </form>
    </WizardShell>
  );
}

// ── Step 3: Business Type & Objective ─────────────────────────────────────────
function StepBusinessProfile({
  isPaid, defaultValues, onBack, onNext, loading,
}: {
  isPaid: boolean;
  defaultValues: { businessType?: string; primaryObjective?: string };
  onBack: () => void;
  onNext: (data: { businessType: string; primaryObjective: string }) => void;
  loading: boolean;
}) {
  const [selectedType, setSelectedType] = useState(defaultValues.businessType ?? "");
  const [selectedObj, setSelectedObj] = useState(defaultValues.primaryObjective ?? "");

  const handleNext = () => {
    if (!selectedType) { toast.error("Selecione o tipo de negócio."); return; }
    if (!selectedObj) { toast.error("Selecione seu objetivo principal."); return; }
    onNext({ businessType: selectedType, primaryObjective: selectedObj });
  };

  return (
    <WizardShell step={3} totalSteps={7} title="Perfil do Negócio" subtitle="Personalize sua experiência" isPaid={isPaid}>
      <div className="space-y-6">
        <div>
          <Label className="text-white/70 text-sm flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-orange-400" /> Tipo de negócio *
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {BUSINESS_TYPES.map((bt) => (
              <button key={bt.id} type="button" onClick={() => setSelectedType(bt.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                  selectedType === bt.id
                    ? "border-orange-500 bg-orange-500/10 text-white"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                }`}>
                <span className="text-xl">{bt.icon}</span>
                <span className="text-xs font-medium leading-tight">{bt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white/70 text-sm flex items-center gap-2 mb-3">
            🎯 Objetivo principal *
          </Label>
          <div className="space-y-2">
            {OBJECTIVES.map((obj) => (
              <button key={obj.id} type="button" onClick={() => setSelectedObj(obj.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  selectedObj === obj.id
                    ? "border-orange-500 bg-orange-500/10 text-white"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                }`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedObj === obj.id ? "border-orange-500 bg-orange-500" : "border-white/30"
                }`}>
                  {selectedObj === obj.id && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm">{obj.label}</span>
              </button>
            ))}
          </div>
        </div>

        <NavButtons onBack={onBack} onNext={handleNext} loading={loading} />
      </div>
    </WizardShell>
  );
}

// ── Step 4: Communication Channels ───────────────────────────────────────────
function StepChannels({
  isPaid, defaultValues, onBack, onNext, loading,
}: {
  isPaid: boolean;
  defaultValues: { channels?: string[] };
  onBack: () => void;
  onNext: (data: { channels: string[] }) => void;
  loading: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(defaultValues.channels ?? []);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleNext = () => {
    if (selected.length === 0) { toast.error("Selecione pelo menos um canal de comunicação."); return; }
    onNext({ channels: selected });
  };

  return (
    <WizardShell step={4} totalSteps={7} title="Canais de Comunicação" subtitle="Por onde você se comunica com seus clientes?" isPaid={isPaid}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isSelected = selected.includes(ch.id);
            return (
              <button key={ch.id} type="button" onClick={() => toggle(ch.id)}
                className={`flex flex-col items-center gap-2 p-5 rounded-xl border transition-all ${
                  isSelected ? `${ch.border} ${ch.bg} text-white` : "border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white"
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? ch.bg : "bg-white/5"}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? ch.color : "text-white/40"}`} />
                </div>
                <span className="text-sm font-medium">{ch.label}</span>
                {isSelected && <CheckCircle2 className={`w-4 h-4 ${ch.color}`} />}
              </button>
            );
          })}
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
          <p className="text-orange-300 text-xs flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            Selecionados: <strong>{selected.length === 0 ? "Nenhum" : selected.map((s) => CHANNELS.find((c) => c.id === s)?.label).join(", ")}</strong>
          </p>
        </div>

        <NavButtons onBack={onBack} onNext={handleNext} loading={loading} />
      </div>
    </WizardShell>
  );
}

// ── Step 5: GHL Token ─────────────────────────────────────────────────────────
const step5Schema = z.object({
  ghlToken: z.string().min(10, "Insira um token GHL válido"),
  ghlCompanyId: z.string().optional(),
});
type Step5Data = z.infer<typeof step5Schema>;

function StepGhlConnect({
  isPaid, defaultValues, onBack, onNext, loading,
}: {
  isPaid: boolean;
  defaultValues: Partial<Step5Data>;
  onBack: () => void;
  onNext: (data: Step5Data) => void;
  loading: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues,
  });

  return (
    <WizardShell step={5} totalSteps={7} title="Conectar GoHighLevel" subtitle="Vincule sua conta GHL para criar a sub-conta" isPaid={isPaid}>
      <form onSubmit={handleSubmit(onNext)} className="space-y-5">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 text-sm font-semibold mb-2">Como obter seu Token GHL:</p>
              <ol className="text-blue-200/70 text-xs space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  Acesse <a href="https://app.gohighlevel.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1 ml-1">GoHighLevel <ExternalLink className="w-3 h-3" /></a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  Vá em <strong className="text-blue-200">Configurações → Integrações Privadas</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  Clique em <strong className="text-blue-200">Criar nova integração</strong> e nomeie como "GetSales4Now"
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                  Copie o token gerado e cole abaixo
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-orange-400" /> Token de Integração Privada GHL *
          </Label>
          <Input {...register("ghlToken")} type="password" placeholder="Cole seu token GHL aqui"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11 font-mono text-sm" />
          {errors.ghlToken && <p className="text-red-400 text-xs">{errors.ghlToken.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" /> ID da Empresa GHL <span className="text-white/30 text-xs">(opcional)</span>
          </Label>
          <Input {...register("ghlCompanyId")} placeholder="ID da sua agência/empresa no GHL"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 h-11" />
          <p className="text-white/30 text-xs">Encontrado em GHL → Configurações → Empresa → ID da Empresa</p>
        </div>

        <NavButtons onBack={onBack} loading={loading} nextLabel="Revisar e Criar Conta" />
      </form>
    </WizardShell>
  );
}

// ── Step 6: Review & Confirm ──────────────────────────────────────────────────
function StepReview({
  isPaid, data, onBack, onConfirm, loading,
}: {
  isPaid: boolean;
  data: WizardData;
  onBack: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const countryName = COUNTRIES.find((c) => c.code === data.country)?.name ?? data.country;
  const bizType = BUSINESS_TYPES.find((b) => b.id === data.businessType)?.label;
  const channelLabels = (data.channels ?? []).map((id) => CHANNELS.find((c) => c.id === id)?.label).filter(Boolean).join(", ");

  const rows = [
    { label: "Empresa", value: data.companyName },
    { label: "E-mail", value: data.companyEmail },
    { label: "Telefone", value: data.companyPhone },
    { label: "Site", value: data.companyWebsite || "—" },
    { label: "País", value: countryName },
    { label: "Cidade", value: [data.city, data.state].filter(Boolean).join(", ") || "—" },
    { label: "Segmento", value: bizType },
    { label: "Canais", value: channelLabels || "—" },
    { label: "Token GHL", value: data.ghlToken ? "••••••••" + data.ghlToken.slice(-4) : "Não informado" },
  ];

  return (
    <WizardShell step={6} totalSteps={7} title="Revisão Final" subtitle="Confirme suas informações antes de criar a sub-conta" isPaid={isPaid}>
      <div className="space-y-2 mb-6">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/5">
            <span className="text-white/40 text-sm">{row.label}</span>
            <span className="text-white text-sm font-medium text-right max-w-xs truncate">{row.value ?? "—"}</span>
          </div>
        ))}
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-2">
        <p className="text-orange-300 text-xs font-semibold mb-2 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" /> O que acontece ao confirmar:
        </p>
        <ul className="text-orange-200/70 text-xs space-y-1.5">
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-400" /> Criamos sua sub-conta no GoHighLevel</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-400" /> Configuramos seu usuário administrador</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-400" /> Você é redirecionado para o dashboard</li>
        </ul>
      </div>

      <NavButtons
        onBack={onBack}
        onNext={onConfirm}
        loading={loading}
        nextLabel={loading ? "Criando sub-conta..." : "Criar Minha Sub-Conta GHL"}
      />
    </WizardShell>
  );
}

// ── Step 7: Creating (loading screen) ────────────────────────────────────────
function StepCreating() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30 animate-pulse">
          <Rocket className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Criando sua sub-conta...</h2>
        <p className="text-white/50 text-sm mb-8">Isso pode levar alguns segundos. Não feche esta página.</p>
        <div className="space-y-3">
          {[
            "Validando token GoHighLevel",
            "Criando sub-conta na plataforma",
            "Configurando usuário administrador",
            "Finalizando configurações",
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
              <Loader2 className="w-4 h-4 text-orange-400 animate-spin shrink-0" style={{ animationDelay: `${i * 0.2}s` }} />
              <span className="text-white/60 text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════
export default function GhlOnboarding() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const isPaid = params.get("paid") === "true";

  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({});
  const [isProvisioning, setIsProvisioning] = useState(false);

  const [provisionSuccess, setProvisionSuccess] = useState(false);

  const updateMutation = trpc.authOwn.updateGhlOnboarding.useMutation();
  const provisionMutation = trpc.ghlProvisioning.triggerProvisioning.useMutation({
    onSuccess: () => {
      setIsProvisioning(false);
      setProvisionSuccess(true);
    },
    onError: (err: { message?: string }) => {
      setIsProvisioning(false);
      toast.error(err.message || "Falha ao criar sub-conta. Tente novamente nas Configurações.");
      navigate("/dashboard");
    },
  });

  const handleProvision = () => {
    setIsProvisioning(true);
    provisionMutation.mutate({
      businessName: data.companyName ?? "Minha Empresa",
      businessEmail: data.companyEmail ?? "",
      businessPhone: data.companyPhone ?? "",
      country: (data.country ?? "BR").slice(0, 2),
      ghlToken: data.ghlToken ?? "",
      ghlCompanyId: data.ghlCompanyId ?? "",
    });
  };

  // Show loading screen during provisioning
  if (isProvisioning) return <StepCreating />;

  // Show success screen after provisioning
  if (provisionSuccess) return <StepSuccess companyName={data.companyName} onGo={() => navigate("/dashboard")} />;

  if (step === 0) return <StepWelcome isPaid={isPaid} onNext={() => setStep(1)} />;

  if (step === 1) return (
    <StepCompanyInfo
      isPaid={isPaid}
      defaultValues={{ companyName: data.companyName, companyEmail: data.companyEmail, companyPhone: data.companyPhone, companyWebsite: data.companyWebsite }}
      onBack={() => setStep(0)}
      loading={updateMutation.isPending}
      onNext={async (d) => {
        setData((prev) => ({ ...prev, ...d }));
        await updateMutation.mutateAsync({ step: 1, data: { companyName: d.companyName, companyPhone: d.companyPhone, companyWebsite: d.companyWebsite } });
        setStep(2);
      }}
    />
  );

  if (step === 2) return (
    <StepLocation
      isPaid={isPaid}
      defaultValues={{ country: data.country, state: data.state, city: data.city, zipCode: data.zipCode }}
      onBack={() => setStep(1)}
      loading={updateMutation.isPending}
      onNext={async (d) => {
        setData((prev) => ({ ...prev, ...d }));
        await updateMutation.mutateAsync({ step: 2, data: { country: d.country ?? "BR", state: d.state, city: d.city, zipCode: d.zipCode } });
        setStep(3);
      }}
    />
  );

  if (step === 3) return (
    <StepBusinessProfile
      isPaid={isPaid}
      defaultValues={{ businessType: data.businessType, primaryObjective: data.primaryObjective }}
      onBack={() => setStep(2)}
      loading={updateMutation.isPending}
      onNext={async (d) => {
        setData((prev) => ({ ...prev, ...d }));
        await updateMutation.mutateAsync({ step: 3, data: { businessType: d.businessType, primaryObjective: d.primaryObjective } });
        setStep(4);
      }}
    />
  );

  if (step === 4) return (
    <StepChannels
      isPaid={isPaid}
      defaultValues={{ channels: data.channels }}
      onBack={() => setStep(3)}
      loading={updateMutation.isPending}
      onNext={async (d) => {
        setData((prev) => ({ ...prev, ...d }));
        await updateMutation.mutateAsync({ step: 4, data: { channels: d.channels } });
        setStep(5);
      }}
    />
  );

  if (step === 5) return (
    <StepGhlConnect
      isPaid={isPaid}
      defaultValues={{ ghlToken: data.ghlToken, ghlCompanyId: data.ghlCompanyId }}
      onBack={() => setStep(4)}
      loading={updateMutation.isPending}
      onNext={async (d) => {
        setData((prev) => ({ ...prev, ...d }));
        await updateMutation.mutateAsync({ step: 5, data: { ghlToken: d.ghlToken, ghlCompanyId: d.ghlCompanyId }, completed: true });
        setStep(6);
      }}
    />
  );

  if (step === 6) return (
    <StepReview
      isPaid={isPaid}
      data={{ ...data }}
      onBack={() => setStep(5)}
      onConfirm={handleProvision}
      loading={provisionMutation.isPending}
    />
  );

  return null;
}
