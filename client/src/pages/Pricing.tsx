import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Check, X, Zap, Building2, Rocket, Crown,
  Users, MessageSquare, BarChart3, Bot, Globe, ArrowRight, Shield
} from "lucide-react";
import { getLoginUrl } from "@/const";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Zap className="w-6 h-6 text-gray-400" />,
  pro: <Rocket className="w-6 h-6 text-orange-500" />,
  business: <Building2 className="w-6 h-6 text-red-500" />,
  agency: <Crown className="w-6 h-6 text-yellow-500" />,
};

const PLAN_COLORS: Record<string, string> = {
  free: "border-gray-700 bg-gray-900/50",
  pro: "border-orange-500 bg-gradient-to-b from-orange-950/40 to-gray-900/80 shadow-orange-500/20 shadow-xl",
  business: "border-red-700 bg-gray-900/50",
  agency: "border-yellow-600 bg-gray-900/50",
};

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { data: plans, isLoading } = trpc.billing.getPlans.useQuery();
  const { data: subscription } = trpc.billing.getSubscription.useQuery(undefined, { enabled: isAuthenticated });
  const createCheckout = trpc.billing.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecionando para o checkout...");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSelectPlan = (planId: string) => {
    if (planId === "free") {
      if (!isAuthenticated) {
        window.location.href = getLoginUrl();
      } else {
        window.location.href = "/dashboard";
      }
      return;
    }
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    createCheckout.mutate({
      plan: planId as "pro" | "business" | "agency",
      billing: yearly ? "yearly" : "monthly",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">GetSales4Now</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                Dashboard
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                Entrar
              </Button>
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="text-center py-16 px-4">
        <Badge className="mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
          Planos e Preços
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-orange-200 to-orange-500 bg-clip-text text-transparent">
          Escolha o plano ideal
          <br />para o seu negócio
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Comece grátis e escale conforme seu negócio cresce. Todos os planos incluem acesso à plataforma completa de Marketing & Sales Automation.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${!yearly ? "text-white" : "text-gray-500"}`}>Mensal</span>
          <Switch
            checked={yearly}
            onCheckedChange={setYearly}
            className="data-[state=checked]:bg-orange-500"
          />
          <span className={`text-sm font-medium ${yearly ? "text-white" : "text-gray-500"}`}>
            Anual
            <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              2 meses grátis
            </Badge>
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
          {plans?.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id;
            const price = yearly ? plan.price.yearly : plan.price.monthly;
            const monthlyEquivalent = yearly ? Math.round(plan.price.yearly / 12) : plan.price.monthly;

            return (
              <Card
                key={plan.id}
                className={`relative border-2 ${PLAN_COLORS[plan.id]} transition-all duration-300 hover:scale-[1.02]`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white border-0 px-4 py-1 text-xs font-bold">
                      MAIS POPULAR
                    </Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500 text-white border-0 px-3 py-1 text-xs font-bold">
                      PLANO ATUAL
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    {PLAN_ICONS[plan.id]}
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                      <p className="text-xs text-gray-400">{plan.description}</p>
                    </div>
                  </div>

                  <div className="text-left mt-2">
                    {price === 0 ? (
                      <div className="text-3xl font-black text-white">Grátis</div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm text-gray-400">USD</span>
                          <span className="text-3xl font-black text-white">${monthlyEquivalent}</span>
                          <span className="text-sm text-gray-400">/mês</span>
                        </div>
                        {yearly && (
                          <p className="text-xs text-gray-500 mt-1">
                            USD ${price}/ano — economize ${plan.price.monthly * 12 - price}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Features list */}
                  <ul className="space-y-2 mb-6 text-left">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Limits summary */}
                  <div className="border border-gray-700/50 rounded-lg p-3 mb-4 bg-gray-800/30 text-left">
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{plan.limits.contacts === -1 ? "∞" : plan.limits.contacts} contatos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{plan.limits.campaigns === -1 ? "∞" : plan.limits.campaigns} campanhas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        <span>{plan.limits.aiCredits === -1 ? "∞" : plan.limits.aiCredits} créditos IA</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{plan.limits.ghlSubAccount ? "Sub-conta GHL" : "Sem GHL"}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className={`w-full font-semibold ${
                      plan.highlighted
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : isCurrentPlan
                        ? "bg-green-700 hover:bg-green-800 text-white cursor-default"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                    onClick={() => !isCurrentPlan && handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan || createCheckout.isPending}
                  >
                    {isCurrentPlan ? (
                      "Plano Atual"
                    ) : plan.id === "free" ? (
                      <>Começar Grátis <ArrowRight className="w-4 h-4 ml-1" /></>
                    ) : createCheckout.isPending ? (
                      "Processando..."
                    ) : (
                      <>Assinar {plan.name} <ArrowRight className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Pagamento seguro via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Cancele a qualquer momento</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Suporte em PT-BR, EN e ES</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Sub-conta GHL incluída nos planos pagos</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto text-left px-4">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "O que é a sub-conta GoHighLevel?",
                a: "Ao assinar um plano pago, criamos automaticamente um ambiente isolado no GoHighLevel para o seu negócio. Isso inclui CRM, automações, inbox e muito mais — tudo integrado ao GetSales4Now.",
              },
              {
                q: "Posso mudar de plano a qualquer momento?",
                a: "Sim. Você pode fazer upgrade ou downgrade a qualquer momento. No upgrade, o novo plano entra em vigor imediatamente com crédito proporcional. No downgrade, a mudança ocorre no próximo ciclo de cobrança.",
              },
              {
                q: "Quais formas de pagamento são aceitas?",
                a: "Aceitamos cartões de crédito e débito internacionais via Stripe. Para clientes brasileiros, também aceitamos boleto bancário e Pix através do Stripe.",
              },
              {
                q: "O que acontece com meus dados se cancelar?",
                a: "Seus dados ficam disponíveis por 30 dias após o cancelamento. Você pode exportar tudo antes desse prazo. Após 30 dias, os dados são excluídos permanentemente.",
              },
            ].map((item, i) => (
              <div key={i} className="border border-gray-800 rounded-xl p-5 bg-gray-900/50">
                <h3 className="font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 py-16 px-4">
          <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-orange-950/50 to-red-950/50 border border-orange-800/30 rounded-2xl p-10">
            <h2 className="text-3xl font-black text-white mb-4">
              Pronto para escalar suas vendas?
            </h2>
            <p className="text-gray-400 mb-8">
              Comece grátis hoje. Sem cartão de crédito necessário para o plano Free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8"
                onClick={() => handleSelectPlan("free")}
              >
                Começar Grátis
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-orange-600 text-orange-400 hover:bg-orange-950/50 font-bold px-8"
                onClick={() => handleSelectPlan("pro")}
              >
                Ver Plano Pro
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
