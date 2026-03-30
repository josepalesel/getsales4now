/**
 * GetSales4Now — Stripe Test Cards Page
 * Accessible at /test-cards — for use during sandbox/testing period only
 */
import { useState } from "react";
import { Link } from "wouter";
import { Copy, Check, CreditCard, AlertTriangle, ShieldCheck, Wifi, Ban, Clock, DollarSign, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface TestCard {
  number: string;
  label: string;
  description: string;
  result: "success" | "declined" | "auth" | "insufficient" | "expired" | "processing";
  icon: React.ReactNode;
  badge: string;
  badgeVariant: "default" | "destructive" | "secondary" | "outline";
  tip?: string;
}

const TEST_CARDS: TestCard[] = [
  {
    number: "4242 4242 4242 4242",
    label: "Pagamento Aprovado",
    description: "Simula um pagamento bem-sucedido. Use este para testar o fluxo completo de assinatura.",
    result: "success",
    icon: <Check className="w-5 h-5" />,
    badge: "✓ Aprovado",
    badgeVariant: "default",
    tip: "Mais usado para testar o onboarding completo",
  },
  {
    number: "4000 0025 0000 3155",
    label: "Autenticação 3D Secure",
    description: "Exige confirmação adicional do banco (3DS). Testa o fluxo de autenticação extra.",
    result: "auth",
    icon: <ShieldCheck className="w-5 h-5" />,
    badge: "🔐 3D Secure",
    badgeVariant: "secondary",
    tip: "Clique em 'Autenticar' na janela que aparecer",
  },
  {
    number: "4000 0000 0000 9995",
    label: "Fundos Insuficientes",
    description: "Simula um cartão com saldo insuficiente. Útil para testar mensagens de erro.",
    result: "insufficient",
    icon: <DollarSign className="w-5 h-5" />,
    badge: "⚠ Sem Saldo",
    badgeVariant: "destructive",
  },
  {
    number: "4000 0000 0000 0002",
    label: "Cartão Recusado",
    description: "Simula uma recusa genérica do cartão. Testa o tratamento de erros de pagamento.",
    result: "declined",
    icon: <Ban className="w-5 h-5" />,
    badge: "✗ Recusado",
    badgeVariant: "destructive",
  },
  {
    number: "4000 0000 0000 0069",
    label: "Cartão Expirado",
    description: "Simula um cartão com data de validade vencida.",
    result: "expired",
    icon: <Clock className="w-5 h-5" />,
    badge: "⌛ Expirado",
    badgeVariant: "destructive",
  },
  {
    number: "4000 0000 0000 0119",
    label: "Erro de Processamento",
    description: "Simula uma falha técnica no processamento. Testa resiliência do sistema.",
    result: "processing",
    icon: <Wifi className="w-5 h-5" />,
    badge: "⚡ Erro Técnico",
    badgeVariant: "outline",
  },
];

const FILL_INFO = [
  { label: "Validade", value: "12/29", desc: "Qualquer data futura" },
  { label: "CVC", value: "123", desc: "Qualquer 3 dígitos" },
  { label: "CEP / ZIP", value: "10001", desc: "Qualquer número" },
  { label: "Nome", value: "Test User", desc: "Qualquer nome" },
];

// ─── Card Component ────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const clean = text.replace(/\s/g, "");
    await navigator.clipboard.writeText(clean);
    setCopied(true);
    toast.success(`Copiado: ${text}`, { duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium text-white/80 hover:text-white border border-white/10 hover:border-white/30"
      title="Copiar número"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}

function CardResultBadge({ variant, label }: { variant: TestCard["badgeVariant"]; label: string }) {
  const colors: Record<string, string> = {
    default: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    destructive: "bg-red-500/20 text-red-300 border-red-500/30",
    secondary: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    outline: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[variant]}`}>
      {label}
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TestCards() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#020817]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Cartões de Teste — Stripe Sandbox</h1>
              <p className="text-xs text-white/40">Apenas para ambiente de testes. Nenhuma cobrança real.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="text-xs border-white/20 text-white/70 hover:text-white bg-transparent">
                Ver Planos
              </Button>
            </Link>
            <a
              href="https://dashboard.stripe.com/test/payments"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="text-xs bg-[#635BFF] hover:bg-[#5248e0] text-white gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Stripe Dashboard
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* Alert Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Ambiente de Testes Ativo</p>
            <p className="text-xs text-amber-200/70 mt-0.5">
              Estes cartões funcionam <strong>apenas no Stripe Sandbox</strong>. Nenhum valor real é cobrado.
              Para ativar o sandbox, acesse{" "}
              <a
                href="https://dashboard.stripe.com/claim_sandbox/YWNjdF8xVEdOWjdHcm4zZWRyWlFULDE3NzU0MTU4Mzkv100Pp1bpryd"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-amber-300 hover:text-amber-200"
              >
                este link
              </a>{" "}
              antes de 28/05/2026.
            </p>
          </div>
        </div>

        {/* How to fill */}
        <section>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xs text-orange-400 font-bold">1</span>
            Como Preencher o Formulário de Pagamento
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FILL_INFO.map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                <span className="text-xs text-white/40 uppercase tracking-wide">{item.label}</span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-mono font-bold text-white">{item.value}</span>
                  <CopyButton text={item.value} />
                </div>
                <span className="text-xs text-white/40">{item.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Test Cards */}
        <section>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xs text-orange-400 font-bold">2</span>
            Escolha o Cenário de Teste
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {TEST_CARDS.map((card) => (
              <div
                key={card.number}
                className="group relative p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      card.result === "success" ? "bg-emerald-500/20 text-emerald-400" :
                      card.result === "auth" ? "bg-blue-500/20 text-blue-400" :
                      card.result === "processing" ? "bg-orange-500/20 text-orange-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{card.label}</p>
                      <CardResultBadge variant={card.badgeVariant} label={card.badge} />
                    </div>
                  </div>
                </div>

                {/* Card number */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10 mb-3">
                  <span className="font-mono text-base tracking-widest text-white/90 select-all">
                    {card.number}
                  </span>
                  <CopyButton text={card.number} />
                </div>

                {/* Description */}
                <p className="text-xs text-white/50 leading-relaxed">{card.description}</p>

                {/* Tip */}
                {card.tip && (
                  <p className="mt-2 text-xs text-orange-400/80 flex items-center gap-1">
                    <span>💡</span> {card.tip}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Quick Test Flow */}
        <section>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xs text-orange-400 font-bold">3</span>
            Fluxo de Teste Recomendado
          </h2>
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            {[
              { step: "1", label: "Acesse /pricing", desc: "Escolha Starter ou Business", icon: "🏷️" },
              { step: "2", label: "Crie uma conta", desc: "Use qualquer e-mail de teste", icon: "👤" },
              { step: "3", label: "Checkout Stripe", desc: "Use o cartão 4242 4242 4242 4242", icon: "💳" },
              { step: "4", label: "Tela de boas-vindas", desc: "Trial de 14 dias ativado", icon: "🎉" },
              { step: "5", label: "Dashboard Stripe", desc: "Veja a transação em tempo real", icon: "📊" },
            ].map((item, idx, arr) => (
              <div key={item.step} className="flex items-center gap-2 flex-1">
                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs font-bold text-white">{item.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                </div>
                {idx < arr.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-white/20 shrink-0 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 pb-8">
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-8 gap-2">
              <CreditCard className="w-4 h-4" />
              Ir para Página de Planos
            </Button>
          </Link>
          <a
            href="https://dashboard.stripe.com/claim_sandbox/YWNjdF8xVEdOWjdHcm4zZWRyWlFULDE3NzU0MTU4Mzkv100Pp1bpryd"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="border-white/20 text-white/70 hover:text-white bg-transparent gap-2">
              <ExternalLink className="w-4 h-4" />
              Ativar Stripe Sandbox
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
