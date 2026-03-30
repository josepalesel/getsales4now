/**
 * GetSales4Now — Landing Page / Sales Funnel
 * Objetivo: converter visitante em assinante em 3 cliques
 * Fluxo: Hero CTA → Planos → Cadastro → Pagamento → Wizard GHL → Sub-conta criada
 */
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Check, Zap, Building2, Rocket, Shield,
  MessageSquare, Users, BarChart3, Bot, Globe, Star,
  ChevronRight, Mail, CheckCircle2
} from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030051896/YU6nqmaEyUsACHGWVz8xRF/GetSales4Now_logo_transparent_a2f08e10.jpg";

// ─── Plan Data ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "US$ 118",
    period: "/mês",
    badge: null,
    color: "from-orange-500 to-orange-600",
    border: "border-orange-500/40",
    glow: "shadow-orange-500/20",
    features: [
      "Sub-conta GoHighLevel criada automaticamente",
      "Até 5.000 contatos",
      "3 usuários",
      "CRM + Pipeline de vendas",
      "Campanhas Email, WhatsApp e SMS",
      "Calendário de redes sociais",
      "Geração de conteúdo com IA",
      "Relatórios básicos",
      "Trial de 14 dias grátis",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "US$ 398",
    period: "/mês",
    badge: "Mais Popular",
    color: "from-red-500 to-red-600",
    border: "border-red-500/60",
    glow: "shadow-red-500/30",
    features: [
      "Sub-conta GoHighLevel criada automaticamente",
      "Contatos ilimitados",
      "10 usuários",
      "CRM avançado + IA de scoring",
      "Todos os canais (Email, WhatsApp, SMS)",
      "Construtor de funis completo",
      "Inbox omnichannel",
      "6 agentes de IA copiloto",
      "White-label disponível",
      "Suporte prioritário",
      "Trial de 14 dias grátis",
    ],
  },
];

const STEPS = [
  { n: "1", label: "Escolha seu plano", desc: "Starter ou Business — 14 dias grátis" },
  { n: "2", label: "Crie sua conta", desc: "Nome, e-mail e senha em 30 segundos" },
  { n: "3", label: "Pagamento seguro", desc: "Stripe — sem cobrança no trial" },
  { n: "4", label: "Dados da empresa", desc: "Wizard rápido de onboarding" },
  { n: "5", label: "Sub-conta GHL criada!", desc: "Sua conta está pronta para usar" },
];

const FEATURES = [
  { icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", title: "CRM Completo", desc: "Organize contatos, acompanhe oportunidades e nunca perca um follow-up." },
  { icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10", title: "Inbox Omnichannel", desc: "WhatsApp, e-mail, SMS e redes sociais em uma única caixa de entrada." },
  { icon: Bot, color: "text-purple-400", bg: "bg-purple-500/10", title: "IA Copiloto", desc: "Agentes de IA que geram conteúdo, qualificam leads e automatizam follow-ups." },
  { icon: BarChart3, color: "text-orange-400", bg: "bg-orange-500/10", title: "Relatórios em Tempo Real", desc: "Dashboards de performance de campanhas, funis e equipe de vendas." },
  { icon: Rocket, color: "text-red-400", bg: "bg-red-500/10", title: "Funis de Vendas", desc: "Construa landing pages e funis de alta conversão sem código." },
  { icon: Globe, color: "text-cyan-400", bg: "bg-cyan-500/10", title: "Multi-idioma", desc: "Plataforma disponível em Português, Inglês e Espanhol." },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const handlePlanCTA = (planId: string) => {
    navigate(`/register?plan=${planId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817]">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="GetSales4Now" className="w-16 h-16 rounded-xl animate-pulse" />
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Authenticated: redirect to dashboard
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817]">
        <div className="text-center space-y-4">
          <img src={LOGO_URL} alt="GetSales4Now" className="w-16 h-16 rounded-xl mx-auto" />
          <p className="text-white/50">Redirecionando para o dashboard...</p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 gap-2">
              Ir para o Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#020817]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="GetSales4Now" className="w-9 h-9 rounded-xl object-cover" />
            <span className="text-white font-bold text-lg tracking-tight">GetSales4Now</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
            <button
              onClick={() => handlePlanCTA("starter")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-sm transition-all"
            >
              Começar grátis <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 blur-3xl rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Sub-conta GoHighLevel criada em minutos — automaticamente
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Venda mais com{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              automação inteligente
            </span>
            <br />e sua conta GHL pronta na hora
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Assine um plano, preencha os dados da sua empresa e sua sub-conta GoHighLevel é criada automaticamente. CRM, campanhas, IA e muito mais — tudo integrado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => handlePlanCTA("starter")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-orange-500/30"
            >
              Começar com Starter — US$ 118/mês
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePlanCTA("business")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white font-semibold text-lg transition-all"
            >
              Ver plano Business
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white/40 text-sm">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-500" /> 14 dias grátis</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> Sem cobrança no trial</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> Cancele a qualquer momento</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-500" /> Pagamento seguro via Stripe</span>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-4 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Como funciona em 5 passos</h2>
            <p className="text-white/50">Da assinatura à sub-conta GHL ativa em menos de 5 minutos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STEPS.map((step, idx) => (
              <div key={step.n} className="flex flex-col items-center text-center relative">
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[60%] w-full h-px bg-gradient-to-r from-orange-500/40 to-transparent" />
                )}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm mb-3 relative z-10 shadow-lg shadow-orange-500/30">
                  {step.n}
                </div>
                <p className="text-white text-sm font-semibold mb-1">{step.label}</p>
                <p className="text-white/40 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="planos" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Escolha seu plano</h2>
            <p className="text-white/50">14 dias grátis em todos os planos. Sem cobrança hoje.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 ${plan.border} bg-white/[0.03] p-8 flex flex-col shadow-2xl ${plan.glow}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    <span className="text-white/40 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-white/80 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanCTA(plan.id)}
                  className={`w-full py-4 rounded-xl font-bold text-white text-base bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg`}
                >
                  Começar trial grátis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Corp plan */}
          <div className="mt-6 p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-white/60" />
                <h3 className="text-lg font-bold text-white">Plano Corp</h3>
                <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">Sob consulta</span>
              </div>
              <p className="text-white/50 text-sm">Para grandes empresas e redes. Múltiplas sub-contas, white-label, SLA dedicado e integrações customizadas.</p>
            </div>
            <a
              href="mailto:contato@getsales4now.agency?subject=Plano Corp - Consulta"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-sm font-semibold"
            >
              <Mail className="w-4 h-4" />
              Falar com consultor
            </a>
          </div>

          <div className="flex justify-center mt-6">
            <Link href="/test-cards">
              <span className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-orange-400 transition-colors border border-white/10 hover:border-orange-500/30 rounded-full px-4 py-1.5 cursor-pointer">
                💳 Ambiente de testes? Veja os cartões de teste do Stripe
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 px-4 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Tudo que sua empresa precisa</h2>
            <p className="text-white/50">Uma plataforma completa, integrada ao GoHighLevel</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-3`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-white font-semibold mb-1">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">O que nossos clientes dizem</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Maria González", role: "Salão de Beleza", country: "🇲🇽 México", text: "Passei de perder leads para triplicar meus agendamentos. O GetSales4Now é incrível!" },
              { name: "Carlos Mendes", role: "Corretor de Imóveis", country: "🇧🇷 Brasil", text: "Finalmente um CRM que eu consigo usar! Minha sub-conta GHL foi criada em minutos." },
              { name: "Sofia Reyes", role: "Corretora de Seguros", country: "🇨🇴 Colômbia", text: "As campanhas de WhatsApp me geram leads todos os dias no piloto automático." },
            ].map((t) => (
              <div key={t.name} className="p-6 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-white/60 text-sm leading-relaxed italic">"{t.text}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.role} · {t.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 border-y border-orange-500/20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 text-green-400 text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            14 dias grátis — sem cartão cobrado hoje
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Pronto para começar?</h2>
          <p className="text-white/60 text-lg mb-8">
            Assine agora e sua sub-conta GoHighLevel estará ativa em minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handlePlanCTA("starter")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-orange-500/30"
            >
              Começar com Starter
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePlanCTA("business")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white font-semibold text-lg transition-all"
            >
              Ver plano Business
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="GetSales4Now" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-white/60 text-sm font-medium">GetSales4Now</span>
          </div>
          <div className="flex items-center gap-6 text-white/40 text-xs">
            <a href="mailto:contato@getsales4now.agency" className="hover:text-white/70 transition-colors flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> contato@getsales4now.agency
            </a>
            <Link href="/login" className="hover:text-white/70 transition-colors">Entrar</Link>
            <Link href="/test-cards" className="hover:text-white/70 transition-colors">Cartões de Teste</Link>
          </div>
          <p className="text-white/30 text-xs">© 2026 GetSales4Now. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
