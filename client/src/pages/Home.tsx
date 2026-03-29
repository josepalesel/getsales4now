import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Users,
  Megaphone,
  Share2,
  GitBranch,
  MessageSquare,
  Bot,
  BarChart3,
  Plug,
  ArrowRight,
  CheckCircle2,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  Star,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030051896/YU6nqmaEyUsACHGWVz8xRF/GetSales4Now_logo_transparent_a2f08e10.jpg";

const FEATURES = [
  {
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    keyTitle: "nav.crm",
    descEn: "Organize contacts, track opportunities, and never miss a follow-up.",
    descEs: "Organiza contactos, rastrea oportunidades y nunca pierdas un seguimiento.",
    descPt: "Organize contatos, acompanhe oportunidades e nunca perca um follow-up.",
  },
  {
    icon: Megaphone,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    keyTitle: "nav.campaigns",
    descEn: "Create email, WhatsApp and SMS campaigns with AI assistance.",
    descEs: "Crea campañas de email, WhatsApp y SMS con asistencia de IA.",
    descPt: "Crie campanhas de email, WhatsApp e SMS com assistência de IA.",
  },
  {
    icon: Share2,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    keyTitle: "nav.social",
    descEn: "Plan, generate and schedule social media posts in multiple languages.",
    descEs: "Planifica, genera y programa publicaciones en múltiples idiomas.",
    descPt: "Planeje, gere e agende posts em múltiplos idiomas.",
  },
  {
    icon: GitBranch,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    keyTitle: "nav.funnels",
    descEn: "Build sales funnels with templates by niche and objective.",
    descEs: "Construye embudos de ventas con plantillas por nicho y objetivo.",
    descPt: "Construa funis de vendas com templates por nicho e objetivo.",
  },
  {
    icon: MessageSquare,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    keyTitle: "nav.inbox",
    descEn: "Unified inbox for WhatsApp, email, SMS and web chat.",
    descEs: "Bandeja unificada para WhatsApp, email, SMS y chat web.",
    descPt: "Caixa unificada para WhatsApp, email, SMS e chat web.",
  },
  {
    icon: Bot,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    keyTitle: "nav.ai",
    descEn: "AI copilots for CRM, content, funnels, support and reports.",
    descEs: "Copilotos IA para CRM, contenido, embudos, soporte y reportes.",
    descPt: "Copilotos IA para CRM, conteúdo, funis, suporte e relatórios.",
  },
  {
    icon: BarChart3,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    keyTitle: "nav.reports",
    descEn: "Simple dashboards showing leads, bookings and conversions in plain language.",
    descEs: "Paneles simples con prospectos, citas y conversiones en lenguaje claro.",
    descPt: "Painéis simples com leads, agendamentos e conversões em linguagem clara.",
  },
  {
    icon: Plug,
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    keyTitle: "nav.integrations",
    descEn: "Connect GoHighLevel, n8n, WhatsApp, Meta, LinkedIn and more.",
    descEs: "Conecta GoHighLevel, n8n, WhatsApp, Meta, LinkedIn y más.",
    descPt: "Conecte GoHighLevel, n8n, WhatsApp, Meta, LinkedIn e mais.",
  },
];

const TESTIMONIALS = [
  {
    name: "Maria González",
    role: "Beauty Salon Owner",
    country: "🇲🇽 Mexico",
    text: "I went from losing leads to booking 3x more appointments. GetSales4Now made it so simple!",
    rating: 5,
  },
  {
    name: "Carlos Mendes",
    role: "Real Estate Agent",
    country: "🇧🇷 Brazil",
    text: "Finalmente um CRM que eu consigo usar! Sem precisar de curso ou suporte técnico.",
    rating: 5,
  },
  {
    name: "Sofia Reyes",
    role: "Insurance Broker",
    country: "🇨🇴 Colombia",
    text: "Las campañas de WhatsApp me generan leads todos los días en piloto automático.",
    rating: 5,
  },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const getDesc = (f: typeof FEATURES[0]) => {
    if (language === "es") return f.descEs;
    if (language === "pt") return f.descPt;
    return f.descEn;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="GetSales4Now" className="w-16 h-16 rounded-xl animate-pulse" />
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <img src={LOGO_URL} alt="GetSales4Now" className="w-16 h-16 rounded-xl mx-auto" />
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
          <Link href="/dashboard">
            <Button className="brand-gradient text-white border-0">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="GetSales4Now" className="w-9 h-9 rounded-lg object-cover" />
            <div>
              <span className="font-bold text-base brand-gradient-text">GetSales4Now</span>
              <p className="text-[10px] text-muted-foreground leading-none hidden sm:block">Digital Marketing & Sales Automation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs uppercase font-medium">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(language === lang.code && "font-semibold text-primary")}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.nativeName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="brand-gradient text-white border-0 shadow-sm">
                {t("landing.ctaPrimary")} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-background to-red-50 dark:from-orange-950/20 dark:via-background dark:to-red-950/20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl" />

        <div className="container relative py-20 md:py-28 lg:py-36">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge className="brand-gradient text-white border-0 px-4 py-1.5 text-sm font-medium shadow-md">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                AI-Powered · Trilingual · No Tech Skills Needed
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="brand-gradient-text">{t("landing.hero")}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("landing.heroSub")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="brand-gradient text-white border-0 shadow-lg px-8 h-12 text-base font-semibold hover:opacity-90 transition-opacity">
                  {t("landing.ctaPrimary")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="px-8 h-12 text-base font-semibold">
                  {t("landing.ctaSecondary")}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
              {[
                { icon: CheckCircle2, text: "Free 14-day trial" },
                { icon: Shield, text: "LGPD/GDPR compliant" },
                { icon: Globe, text: "EN · ES · PT" },
                { icon: TrendingUp, text: "No credit card required" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("landing.features")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {language === "pt"
                ? "Uma plataforma completa para empreendedores que querem crescer sem complicação"
                : language === "es"
                ? "Una plataforma completa para emprendedores que quieren crecer sin complicaciones"
                : "A complete platform for entrepreneurs who want to grow without the complexity"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.keyTitle}
                  className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-default"
                >
                  <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center mb-4", feature.bg)}>
                    <Icon className={cn("w-5 h-5", feature.color)} />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{t(feature.keyTitle)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{getDesc(feature)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/40">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("landing.testimonials")}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role} · {testimonial.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 brand-gradient">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {language === "pt" ? "Pronto para crescer?" : language === "es" ? "¿Listo para crecer?" : "Ready to grow?"}
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            {language === "pt"
              ? "Comece grátis hoje. Sem cartão de crédito. Sem complicação."
              : language === "es"
              ? "Empieza gratis hoy. Sin tarjeta de crédito. Sin complicaciones."
              : "Start free today. No credit card. No complexity."}
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-10 h-12 text-base shadow-xl">
              {t("landing.ctaPrimary")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="GetSales4Now" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-sm brand-gradient-text">GetSales4Now</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © 2025 GetSales4Now · Digital Marketing & Sales Automation
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
