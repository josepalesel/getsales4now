import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  CreditCard, Zap, Rocket, Building2, Crown,
  CheckCircle2, Clock, AlertCircle, Settings,
  ArrowUpRight, RefreshCw, Globe, Users, Bot
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Zap className="w-5 h-5 text-gray-400" />,
  pro: <Rocket className="w-5 h-5 text-orange-500" />,
  business: <Building2 className="w-5 h-5 text-red-500" />,
  agency: <Crown className="w-5 h-5 text-yellow-500" />,
};

const GHL_STATUS_CONFIG = {
  pending: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: <Clock className="w-4 h-4" />, label: "Aguardando" },
  provisioning: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <RefreshCw className="w-4 h-4 animate-spin" />, label: "Provisionando..." },
  active: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle2 className="w-4 h-4" />, label: "Ativo" },
  failed: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <AlertCircle className="w-4 h-4" />, label: "Falhou" },
  suspended: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: <AlertCircle className="w-4 h-4" />, label: "Suspenso" },
};

export default function Billing() {
  const { user } = useAuth();
  const [showGhlForm, setShowGhlForm] = useState(false);
  const [ghlToken, setGhlToken] = useState("");
  const [ghlCompanyId, setGhlCompanyId] = useState("");
  const [businessName, setBusinessName] = useState(user?.name ?? "");
  const [businessEmail, setBusinessEmail] = useState(user?.email ?? "");

  const { data: subscription, refetch: refetchSub } = trpc.billing.getSubscription.useQuery();
  const { data: provisioningData, refetch: refetchProvisioning } = trpc.billing.getProvisioningStatus.useQuery();

  const cancelSubscription = trpc.billing.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Assinatura cancelada. Acesso mantido até o fim do período.");
      refetchSub();
    },
    onError: (err) => toast.error(err.message),
  });

  const triggerProvisioning = trpc.ghlProvisioning.triggerProvisioning.useMutation({
    onSuccess: (data) => {
      toast.success(`Sub-conta GHL criada: ${data.locationName}`);
      setShowGhlForm(false);
      refetchSub();
      refetchProvisioning();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleProvision = () => {
    if (!ghlToken || !ghlCompanyId || !businessName || !businessEmail) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    triggerProvisioning.mutate({
      ghlToken,
      ghlCompanyId,
      businessName,
      businessEmail,
    });
  };

  const planName = subscription?.plan ?? "free";
  const ghlStatus = subscription?.ghlStatus ?? "pending";
  const ghlStatusConfig = GHL_STATUS_CONFIG[ghlStatus];
  const isPaidPlan = planName !== "free";

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-orange-500" />
              Assinatura & Cobrança
            </h1>
            <p className="text-gray-400 text-sm mt-1">Gerencie seu plano e a integração com GoHighLevel</p>
          </div>
          <Link href="/pricing">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Ver Planos
            </Button>
          </Link>
        </div>

        {/* Current Plan */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {PLAN_ICONS[planName]}
              Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-white capitalize">{planName}</span>
                  <Badge className={
                    subscription?.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                    subscription?.status === "canceled" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                    "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }>
                    {subscription?.status ?? "active"}
                  </Badge>
                </div>
                {subscription?.currentPeriodEnd && (
                  <p className="text-gray-400 text-sm mt-1">
                    Próxima cobrança: {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
              {isPaidPlan && subscription?.status !== "canceled" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-700 text-red-400 hover:bg-red-950/50"
                  onClick={() => {
                    if (confirm("Tem certeza que deseja cancelar sua assinatura?")) {
                      cancelSubscription.mutate();
                    }
                  }}
                  disabled={cancelSubscription.isPending}
                >
                  Cancelar Assinatura
                </Button>
              )}
            </div>

            {/* Plan limits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {[
                { icon: <Users className="w-4 h-4" />, label: "Contatos", value: subscription?.contactsLimit === -1 ? "Ilimitado" : subscription?.contactsLimit ?? 100 },
                { icon: <Users className="w-4 h-4" />, label: "Usuários", value: subscription?.usersLimit === -1 ? "Ilimitado" : subscription?.usersLimit ?? 1 },
                { icon: <Globe className="w-4 h-4" />, label: "Sub-conta GHL", value: isPaidPlan ? "Incluída" : "Não incluída" },
                { icon: <Bot className="w-4 h-4" />, label: "IA", value: isPaidPlan ? "Ativada" : "Básica" },
              ].map((item, i) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <div className="text-white font-semibold text-sm">{item.value}</div>
                </div>
              ))}
            </div>

            {!isPaidPlan && (
              <div className="bg-orange-950/30 border border-orange-800/30 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-orange-300 font-medium text-sm">Faça upgrade para desbloquear mais recursos</p>
                  <p className="text-gray-400 text-xs mt-1">Sub-conta GHL, IA avançada, mais contatos e campanhas</p>
                </div>
                <Link href="/pricing">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                    Upgrade
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GHL Sub-Account */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Sub-conta GoHighLevel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={`${ghlStatusConfig.color} flex items-center gap-1`}>
                    {ghlStatusConfig.icon}
                    {ghlStatusConfig.label}
                  </Badge>
                  {subscription?.ghlLocationName && (
                    <span className="text-gray-300 text-sm font-medium">{subscription.ghlLocationName}</span>
                  )}
                </div>
                {subscription?.ghlLocationId && (
                  <p className="text-gray-500 text-xs mt-1">ID: {subscription.ghlLocationId}</p>
                )}
                {subscription?.ghlProvisionedAt && (
                  <p className="text-gray-500 text-xs">
                    Criada em: {new Date(subscription.ghlProvisionedAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>

              {isPaidPlan && ghlStatus !== "active" && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowGhlForm(!showGhlForm)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {ghlStatus === "failed" ? "Tentar Novamente" : "Configurar GHL"}
                </Button>
              )}
            </div>

            {!isPaidPlan && (
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <Globe className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">A sub-conta GoHighLevel está disponível nos planos Pro, Business e Agency.</p>
                <Link href="/pricing">
                  <Button size="sm" variant="outline" className="mt-3 border-orange-600 text-orange-400 hover:bg-orange-950/50">
                    Ver Planos Pagos
                  </Button>
                </Link>
              </div>
            )}

            {/* GHL Provisioning Form */}
            {showGhlForm && isPaidPlan && (
              <div className="border border-blue-800/30 rounded-xl p-5 bg-blue-950/20 space-y-4">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-400" />
                  Configurar Sub-conta GoHighLevel
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Insira seu token de Private Integration do GoHighLevel. Criaremos automaticamente uma sub-conta (Location) para o seu negócio com todas as permissões necessárias.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-gray-300 text-xs">Token de Integração Privada *</Label>
                    <Input
                      type="password"
                      placeholder="eyJhbGci..."
                      value={ghlToken}
                      onChange={(e) => setGhlToken(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white text-sm"
                    />
                    <p className="text-gray-500 text-xs">GHL → Settings → Private Integrations</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-300 text-xs">Company ID da Agência *</Label>
                    <Input
                      placeholder="abc123xyz..."
                      value={ghlCompanyId}
                      onChange={(e) => setGhlCompanyId(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white text-sm"
                    />
                    <p className="text-gray-500 text-xs">GHL → Settings → Company → ID</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-300 text-xs">Nome do Negócio *</Label>
                    <Input
                      placeholder="Minha Empresa Ltda"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-300 text-xs">Email do Negócio *</Label>
                    <Input
                      type="email"
                      placeholder="contato@empresa.com"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleProvision}
                    disabled={triggerProvisioning.isPending}
                  >
                    {triggerProvisioning.isPending ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Criando sub-conta...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Criar Sub-conta GHL</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-400 hover:bg-gray-800"
                    onClick={() => setShowGhlForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Provisioning logs */}
            {provisioningData?.logs && provisioningData.logs.length > 0 && (
              <div className="space-y-2">
                <p className="text-gray-400 text-xs font-medium">Histórico de Provisionamento</p>
                {provisioningData.logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center gap-3 text-xs bg-gray-800/30 rounded-lg p-2">
                    {log.status === "success" ? (
                      <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                    ) : log.status === "failed" ? (
                      <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                    )}
                    <span className="text-gray-300">{log.action}</span>
                    <span className="text-gray-500 ml-auto">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test card notice */}
        <div className="bg-blue-950/30 border border-blue-800/30 rounded-xl p-4">
          <p className="text-blue-300 text-sm font-medium mb-1">Modo de Teste Stripe</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            Para testar pagamentos, use o cartão <code className="bg-gray-800 px-1 rounded text-blue-300">4242 4242 4242 4242</code> com qualquer data futura e CVC de 3 dígitos.
            Após verificação KYC no Stripe, as chaves de produção devem ser configuradas em Settings → Payment.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
