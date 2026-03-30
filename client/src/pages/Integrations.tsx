import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Plug,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Webhook,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  Zap,
  BarChart2,
  Link2,
  Users,
  TrendingUp,
  Inbox,
  ArrowDownToLine,
  Loader2,
} from "lucide-react";

type Provider = "ghl" | "n8n" | "whatsapp" | "email" | "meta" | "linkedin" | "telephony" | "webhook";

const INTEGRATIONS_CATALOG: {
  id: Provider;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: string;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
}[] = [
  {
    id: "ghl",
    name: "GoHighLevel",
    description: "Primary CRM & automation engine. Sync contacts, pipelines and campaigns.",
    icon: Zap,
    color: "from-orange-400 to-orange-600",
    category: "CRM",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "ghl_..." },
      { key: "locationId", label: "Location ID", placeholder: "loc_..." },
    ],
  },
  {
    id: "n8n",
    name: "n8n Workflows",
    description: "Middleware for complex automations and workflow orchestration.",
    icon: Webhook,
    color: "from-red-400 to-red-600",
    category: "Automation",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", placeholder: "https://n8n.yourdomain.com/webhook/..." },
      { key: "apiKey", label: "API Key (optional)", placeholder: "n8n_api_..." },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Send and receive WhatsApp messages via official Business API.",
    icon: MessageSquare,
    color: "from-green-400 to-green-600",
    category: "Messaging",
    fields: [
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "1234567890" },
      { key: "accessToken", label: "Access Token", placeholder: "EAABs...", type: "password" },
    ],
  },
  {
    id: "email",
    name: "Email (SMTP)",
    description: "Send transactional and campaign emails via your SMTP provider.",
    icon: Mail,
    color: "from-blue-400 to-blue-600",
    category: "Messaging",
    fields: [
      { key: "host", label: "SMTP Host", placeholder: "smtp.gmail.com" },
      { key: "port", label: "Port", placeholder: "587" },
      { key: "user", label: "Username", placeholder: "you@example.com" },
      { key: "password", label: "Password", placeholder: "••••••••", type: "password" },
    ],
  },
  {
    id: "meta",
    name: "Meta Ads",
    description: "Run Facebook & Instagram ad campaigns and track conversions.",
    icon: BarChart2,
    color: "from-blue-500 to-indigo-600",
    category: "Marketing",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "EAABs...", type: "password" },
      { key: "adAccountId", label: "Ad Account ID", placeholder: "act_1234567890" },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Post content and generate B2B leads via LinkedIn API.",
    icon: Link2,
    color: "from-sky-500 to-sky-700",
    category: "Marketing",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "AQV...", type: "password" },
    ],
  },
  {
    id: "telephony",
    name: "Telephony (Twilio)",
    description: "Make and receive calls and SMS via Twilio integration.",
    icon: Phone,
    color: "from-red-500 to-pink-600",
    category: "Messaging",
    fields: [
      { key: "accountSid", label: "Account SID", placeholder: "AC..." },
      { key: "authToken", label: "Auth Token", placeholder: "••••••••", type: "password" },
      { key: "phoneNumber", label: "Phone Number", placeholder: "+1234567890" },
    ],
  },
  {
    id: "webhook",
    name: "Custom Webhook",
    description: "Send events to any external system via HTTP webhooks.",
    icon: Webhook,
    color: "from-gray-400 to-gray-600",
    category: "Custom",
    fields: [
      { key: "url", label: "Webhook URL", placeholder: "https://your-system.com/webhook" },
      { key: "secret", label: "Secret (optional)", placeholder: "webhook_secret_...", type: "password" },
    ],
  },
];

const STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  connected: { icon: CheckCircle2, color: "text-green-500", label: "Connected" },
  disconnected: { icon: XCircle, color: "text-gray-400", label: "Disconnected" },
  error: { icon: AlertCircle, color: "text-red-500", label: "Error" },
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending" },
};

function ConnectDialog({ integration, onSuccess }: { integration: typeof INTEGRATIONS_CATALOG[0]; onSuccess: () => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<Record<string, string>>({});

  const connect = trpc.integrations.connect.useMutation({
    onSuccess: () => {
      toast.success(`${integration.name} connected!`);
      setOpen(false);
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="brand-gradient text-white border-0 h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Connect
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white", integration.color)}>
              <integration.icon className="w-4 h-4" />
            </div>
            Connect {integration.name}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{integration.description}</p>
        <div className="space-y-3 mt-2">
          {integration.fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label>{field.label}</Label>
              <Input
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                value={config[field.key] ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, [field.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
          <Button
            className="brand-gradient text-white border-0"
            disabled={connect.isPending}
            onClick={() => connect.mutate({
              provider: integration.id,
              name: integration.name,
              config,
            })}
          >
            {connect.isPending ? t("common.loading") : "Connect"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── GHL Sync Panel ───────────────────────────────────────────────────────────
function GhlSyncPanel() {
  const { data: status } = trpc.ghlSync.getConnectionStatus.useQuery();
  const { data: stats, refetch: refetchStats } = trpc.ghlSync.getSyncStats.useQuery();

  const syncContacts = trpc.ghlSync.syncContacts.useMutation({
    onSuccess: (r) => {
      toast.success(`Contacts synced: ${r.created} created, ${r.updated} updated`);
      refetchStats();
    },
    onError: (e) => toast.error(`Contacts sync failed: ${e.message}`),
  });

  const syncOpportunities = trpc.ghlSync.syncOpportunities.useMutation({
    onSuccess: (r) => {
      toast.success(`Opportunities synced: ${r.created} created, ${r.updated} updated`);
      refetchStats();
    },
    onError: (e) => toast.error(`Opportunities sync failed: ${e.message}`),
  });

  const syncConversations = trpc.ghlSync.syncConversations.useMutation({
    onSuccess: (r) => {
      toast.success(`Conversations synced: ${r.created} created, ${r.updated} updated`);
      refetchStats();
    },
    onError: (e) => toast.error(`Conversations sync failed: ${e.message}`),
  });

  const syncAll = trpc.ghlSync.syncAll.useMutation({
    onSuccess: (r) => {
      const { contacts: c, opportunities: o, conversations: cv } = r.results;
      toast.success(`Full sync complete! Contacts: ${c.synced}, Opportunities: ${o.synced}, Conversations: ${cv.synced}`);
      refetchStats();
    },
    onError: (e) => toast.error(`Full sync failed: ${e.message}`),
  });

  const isAnySyncing = syncContacts.isPending || syncOpportunities.isPending || syncConversations.isPending || syncAll.isPending;

  if (!status?.connected) return null;

  return (
    <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            GoHighLevel Sync
            <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-0 text-[10px]">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            className="brand-gradient text-white border-0 h-8 text-xs gap-1.5"
            disabled={isAnySyncing}
            onClick={() => syncAll.mutate({})}
          >
            {syncAll.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowDownToLine className="w-3.5 h-3.5" />}
            Sync All
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Location: <span className="font-medium text-foreground">{status.locationName}</span>
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Contacts", value: stats?.contacts ?? 0, icon: Users, color: "text-blue-500" },
            { label: "Opportunities", value: stats?.opportunities ?? 0, icon: TrendingUp, color: "text-green-500" },
            { label: "Conversations", value: stats?.conversations ?? 0, icon: Inbox, color: "text-purple-500" },
          ].map((item) => (
            <div key={item.label} className="bg-background rounded-lg p-3 border border-border text-center">
              <item.icon className={cn("w-4 h-4 mx-auto mb-1", item.color)} />
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Individual sync buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            disabled={isAnySyncing}
            onClick={() => syncContacts.mutate({})}
          >
            {syncContacts.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Users className="w-3 h-3" />}
            Contacts
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            disabled={isAnySyncing}
            onClick={() => syncOpportunities.mutate({})}
          >
            {syncOpportunities.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
            Deals
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            disabled={isAnySyncing}
            onClick={() => syncConversations.mutate({})}
          >
            {syncConversations.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Inbox className="w-3 h-3" />}
            Inbox
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Integrations() {
  const { t } = useLanguage();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { data: connected = [], refetch } = trpc.integrations.list.useQuery();

  const updateStatus = trpc.integrations.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated!"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const connectedIds = new Set((connected as Record<string, unknown>[]).map((c) => String(c.provider)));
  const categories = ["all", ...Array.from(new Set(INTEGRATIONS_CATALOG.map((i) => i.category)))];

  const filtered = categoryFilter === "all"
    ? INTEGRATIONS_CATALOG
    : INTEGRATIONS_CATALOG.filter((i) => i.category === categoryFilter);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{t("integrations.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect your tools to automate workflows and sync data
          </p>
        </div>

        {/* GHL Sync Panel */}
        <GhlSyncPanel />

        {/* Connected integrations */}
        {(connected as Record<string, unknown>[]).length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Active Connections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(connected as Record<string, unknown>[]).map((conn) => {
                const catalog = INTEGRATIONS_CATALOG.find((i) => i.id === conn.provider);
                const status = String(conn.status ?? "connected");
                const statusConf = STATUS_CONFIG[status] ?? STATUS_CONFIG.connected;
                const StatusIcon = statusConf.icon;

                return (
                  <Card key={String(conn.id)} className="border-border">
                    <CardContent className="p-4 flex items-center gap-3">
                      {catalog && (
                        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0", catalog.color)}>
                          <catalog.icon className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{String(conn.name ?? "")}</p>
                        <div className={cn("flex items-center gap-1 text-xs mt-0.5", statusConf.color)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConf.label}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 flex-shrink-0"
                        onClick={() => updateStatus.mutate({ id: Number(conn.id), status: status === "connected" ? "disconnected" : "connected" })}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              className={cn("h-8 text-xs", categoryFilter === cat && "brand-gradient text-white border-0")}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === "all" ? "All" : cat}
            </Button>
          ))}
        </div>

        {/* Integration catalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((integration) => {
            const isConnected = connectedIds.has(integration.id);
            const Icon = integration.icon;

            return (
              <Card key={integration.id} className={cn("border-border hover:shadow-md transition-all", isConnected && "border-green-200 dark:border-green-900")}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0", integration.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{integration.name}</p>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 mt-0.5">{integration.category}</Badge>
                      </div>
                    </div>
                    {isConnected && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-0 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{integration.description}</p>
                  <div className="flex items-center justify-between">
                    {isConnected ? (
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-green-600 border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Manage
                      </Button>
                    ) : (
                      <ConnectDialog integration={integration} onSuccess={refetch} />
                    )}
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
