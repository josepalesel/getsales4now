/**
 * Welcome.tsx — Redireciona automaticamente para o formulário de onboarding.
 * O Stripe success_url aponta para /ghl-onboarding?paid=true diretamente,
 * mas esta rota /welcome também redireciona para garantir compatibilidade.
 */
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Welcome() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/ghl-onboarding?paid=true");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/30">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-white/60 text-sm">Preparando sua conta...</p>
      </div>
    </div>
  );
}
