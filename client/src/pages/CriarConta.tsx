/**
 * /criar-conta — Formulário completo de criação de sub-conta GetSales4Now
 * Combina: dados pessoais + empresa + localização + plano + token GHL
 * Fluxo: Preenche → Registra → Checkout Stripe → Wizard GHL → Dashboard
 */
import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2, User, Mail, Lock, Phone, Globe, MapPin,
  Zap, CheckCircle2, ArrowRight, Eye, EyeOff, Info,
  ChevronRight, Star, Shield, Headphones,
} from "lucide-react";

// ─── Validation schema ────────────────────────────────────────────────────────
const schema = z.object({
  // Pessoal
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
  phone: z.string().min(8, "Telefone inválido"),
  // Empresa
  companyName: z.string().min(2, "Nome da empresa obrigatório"),
  segment: z.string().min(1, "Selecione um segmento"),
  website: z.string().optional(),
  // Localização
  country: z.string().min(2, "Selecione um país"),
  state: z.string().optional(),
  city: z.string().optional(),
  // Plano
  plan: z.enum(["starter", "business"]),
  // GHL
  ghlToken: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

// ─── Data ─────────────────────────────────────────────────────────────────────
const SEGMENTS = [
  "Agência de Marketing Digital",
  "Consultoria Empresarial",
  "E-commerce / Varejo",
  "Imobiliária / Corretora",
  "Educação / Cursos Online",
  "Saúde / Clínica / Medicina",
  "Advocacia / Jurídico",
  "Tecnologia / SaaS",
  "Serviços Financeiros",
  "Construção / Engenharia",
  "Alimentação / Restaurante",
  "Beleza / Estética",
  "Fitness / Academia",
  "Outro",
];

const COUNTRIES = [
  { code: "BR", name: "Brasil" },
  { code: "US", name: "Estados Unidos" },
  { code: "MX", name: "México" },
  { code: "CO", name: "Colômbia" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Peru" },
  { code: "PT", name: "Portugal" },
];

const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    price: "$118",
    period: "/mês",
    description: "Ideal para pequenas empresas e agências iniciantes",
    features: ["Até 5.000 contatos", "3 usuários", "CRM completo", "Automações básicas", "Suporte por e-mail"],
    color: "from-blue-500 to-cyan-600",
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
    badge: null,
  },
  {
    id: "business" as const,
    name: "Business",
    price: "$398",
    period: "/mês",
    description: "Para empresas em crescimento que precisam de mais poder",
    features: ["Contatos ilimitados", "10 usuários", "CRM + Automações avançadas", "WhatsApp + Multi-canal", "Suporte prioritário"],
    color: "from-orange-500 to-red-600",
    border: "border-orange-500/40",
    bg: "bg-orange-500/10",
    badge: "Mais Popular",
  },
];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ num, active, done }: { num: number; active: boolean; done: boolean }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
      ${done ? "bg-green-500 text-white" : active ? "bg-orange-500 text-white ring-4 ring-orange-500/30" : "bg-white/10 text-white/40"}`}>
      {done ? <CheckCircle2 className="w-4 h-4" /> : num}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CriarConta() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const planFromUrl = new URLSearchParams(search).get("plan") as "starter" | "business" | null;
  const [step, setStep] = useState(1); // 1=Pessoal, 2=Empresa, 3=Plano, 4=GHL
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerMutation = trpc.authOwn.register.useMutation();
  const checkoutMutation = trpc.billing.createCheckout.useMutation();
  const updateOnboardingMutation = trpc.authOwn.updateGhlOnboarding.useMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      plan: (planFromUrl === "business" ? "business" : "starter") as "starter" | "business",
      country: "BR",
    },
  });

  const selectedPlan = watch("plan");

  // Validate current step fields before advancing
  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ["name", "email", "password", "confirmPassword", "phone"],
    2: ["companyName", "segment", "country"],
    3: ["plan"],
    4: [],
  };

  const handleNext = async () => {
    const fields = stepFields[step];
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // 1. Register user
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        plan: data.plan,
      });

      // 2. Persist company data immediately after registration
      await updateOnboardingMutation.mutateAsync({
        step: 1,
        data: {
          companyName: data.companyName,
          companyPhone: data.phone,
          companyWebsite: data.website,
          country: data.country,
          state: data.state,
          city: data.city,
          ghlToken: data.ghlToken,
        },
      });

      // 3. Redirect to Stripe checkout
      const result = await checkoutMutation.mutateAsync({
        plan: data.plan,
        billing: "monthly",
      });

      if (result.url) {
        toast.success("Redirecionando para o pagamento seguro...");
        // Open Stripe in new tab; navigate to onboarding wizard to continue
        window.open(result.url, "_blank");
        navigate("/ghl-onboarding?paid=pending");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar conta";
      if (message.includes("already exists") || message.includes("CONFLICT")) {
        toast.error("Este e-mail já possui uma conta. Faça login.");
        navigate("/login");
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Seus dados" },
    { num: 2, label: "Empresa" },
    { num: 3, label: "Plano" },
    { num: 4, label: "Conectar GHL" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#0d1526] to-[#0a0f1e] border-r border-white/5 flex-col justify-between p-10">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">GetSales4Now</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Sua plataforma de vendas<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              começa aqui
            </span>
          </h2>
          <p className="text-white/50 text-base mb-10">
            Preencha o formulário e sua sub-conta no GoHighLevel será criada automaticamente em minutos.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              { icon: CheckCircle2, text: "Sub-conta GHL criada automaticamente" },
              { icon: Shield, text: "14 dias de trial gratuito" },
              { icon: Zap, text: "CRM + Automações prontos para usar" },
              { icon: Headphones, text: "Suporte em português" },
              { icon: Star, text: "Sem contrato de fidelidade" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <p className="text-white/70 text-sm italic mb-3">
            "Em menos de 10 minutos minha sub-conta estava configurada e já estava captando leads."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
              M
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Marcos Silva</p>
              <p className="text-white/40 text-xs">Agência Digital, São Paulo</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">GetSales4Now</span>
          </div>
          <p className="text-white/40 text-sm ml-auto">
            Já tem conta?{" "}
            <button onClick={() => navigate("/login")} className="text-orange-400 hover:text-orange-300 font-medium">
              Fazer login
            </button>
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-start px-6 py-8 max-w-xl mx-auto w-full">
          {/* Step indicator */}
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((s, i) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <StepDot num={s.num} active={step === s.num} done={step > s.num} />
                    <span className={`text-xs mt-1 hidden sm:block ${step === s.num ? "text-orange-400 font-medium" : step > s.num ? "text-green-400" : "text-white/30"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all ${step > s.num ? "bg-green-500" : "bg-white/10"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">

            {/* ── STEP 1: Dados pessoais ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Seus dados de acesso</h2>
                  <p className="text-white/50 text-sm">Crie seu login na plataforma GetSales4Now</p>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Nome completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      {...register("name")}
                      placeholder="João Silva"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 h-11"
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">E-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="joao@empresa.com"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 h-11"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Telefone / WhatsApp *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      {...register("phone")}
                      placeholder="+55 (11) 99999-9999"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 h-11"
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 h-11"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Confirmar senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      {...register("confirmPassword")}
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repita a senha"
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 h-11"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="button" onClick={handleNext}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base rounded-xl">
                  Continuar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* ── STEP 2: Dados da empresa ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Dados da sua empresa</h2>
                  <p className="text-white/50 text-sm">Essas informações serão usadas para configurar sua sub-conta</p>
                </div>

                {/* Company name */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Nome da empresa *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      {...register("companyName")}
                      placeholder="Minha Empresa Ltda"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 h-11"
                    />
                  </div>
                  {errors.companyName && <p className="text-red-400 text-xs">{errors.companyName.message}</p>}
                </div>

                {/* Segment */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Segmento de atuação *</Label>
                  <Select onValueChange={(v) => setValue("segment", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:border-orange-500/50">
                      <SelectValue placeholder="Selecione seu segmento" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2035] border-white/10">
                      {SEGMENTS.map((s) => (
                        <SelectItem key={s} value={s} className="text-white hover:bg-white/10">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.segment && <p className="text-red-400 text-xs">{errors.segment.message}</p>}
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Website <span className="text-white/30">(opcional)</span></Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      {...register("website")}
                      placeholder="https://minhaempresa.com.br"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 h-11"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">País *</Label>
                  <Select defaultValue="BR" onValueChange={(v) => setValue("country", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:border-orange-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2035] border-white/10">
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code} className="text-white hover:bg-white/10">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-red-400 text-xs">{errors.country.message}</p>}
                </div>

                {/* State + City */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">Estado</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        {...register("state")}
                        placeholder="SP"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">Cidade</Label>
                    <Input
                      {...register("city")}
                      placeholder="São Paulo"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 h-11"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}
                    className="flex-1 h-12 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl">
                    Voltar
                  </Button>
                  <Button type="button" onClick={handleNext}
                    className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl">
                    Continuar <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Escolha o plano ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Escolha seu plano</h2>
                  <p className="text-white/50 text-sm">14 dias grátis — cancele quando quiser</p>
                </div>

                <div className="space-y-3">
                  {PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setValue("plan", plan.id)}
                      className={`w-full text-left rounded-2xl border-2 p-5 transition-all relative ${
                        selectedPlan === plan.id
                          ? `${plan.border} ${plan.bg} ring-2 ring-orange-500/20`
                          : "border-white/10 bg-white/3 hover:border-white/20"
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {plan.badge}
                        </span>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.id ? "border-orange-500 bg-orange-500" : "border-white/30"}`}>
                              {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className="text-white font-bold text-lg">{plan.name}</span>
                          </div>
                          <p className="text-white/50 text-xs ml-6">{plan.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <span className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${plan.color}`}>
                            {plan.price}
                          </span>
                          <span className="text-white/40 text-xs">{plan.period}</span>
                        </div>
                      </div>
                      <div className="ml-6 grid grid-cols-2 gap-1">
                        {plan.features.map((f) => (
                          <div key={f} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                            <span className="text-white/60 text-xs">{f}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}
                    className="flex-1 h-12 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl">
                    Voltar
                  </Button>
                  <Button type="button" onClick={handleNext}
                    className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl">
                    Continuar <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 4: Token GHL + Submit ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Conectar GoHighLevel</h2>
                  <p className="text-white/50 text-sm">Opcional agora — você pode configurar depois nas Integrações</p>
                </div>

                {/* GHL Token */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm flex items-center gap-1.5">
                    Token da API Privada GHL
                    <span className="text-white/30 text-xs">(opcional)</span>
                  </Label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      {...register("ghlToken")}
                      placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 h-11 font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-300/80">
                      <p className="font-medium mb-1">Como obter o token:</p>
                      <p>1. Acesse sua conta GHL → Configurações → Integrações</p>
                      <p>2. Clique em "Private Integrations" → Criar novo token</p>
                      <p>3. Copie o token gerado e cole aqui</p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-3">
                  <h3 className="text-white font-semibold text-sm mb-3">Resumo do seu pedido</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Plano</span>
                    <span className="text-white font-medium capitalize">{selectedPlan}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Valor</span>
                    <span className="text-white font-medium">{selectedPlan === "starter" ? "$118" : "$398"}/mês</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Trial gratuito</span>
                    <span className="text-green-400 font-medium">14 dias</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between text-sm">
                    <span className="text-white/50">Cobrado hoje</span>
                    <span className="text-green-400 font-bold text-base">$0,00</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(3)}
                    className="flex-1 h-12 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl">
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-500/20"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Criando conta...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Criar Minha Conta <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>

                <p className="text-center text-white/30 text-xs">
                  Ao criar sua conta você concorda com os{" "}
                  <span className="text-orange-400 cursor-pointer hover:underline">Termos de Uso</span>
                  {" "}e a{" "}
                  <span className="text-orange-400 cursor-pointer hover:underline">Política de Privacidade</span>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
