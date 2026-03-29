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
    name: "Email Provider",
    description: "Connect SMTP, SendGrid, Mailgun or Amazon SES for email campaigns.",
    icon: Mail,
    color: "from-blue-400 to-blue-600",
    category: "Messaging",
    fields: [
      { key: "provider", label: "Provider", placeholder: "sendgrid / mailgun / smtp" },
      { key: "apiKey", label: "API Key", placeholder: "SG...." },
      { key: "fromEmail", label: "From Email", placeholder: "noreply@yourdomain.com" },
    ],
  },
  {
    id: "meta",
    name: "Meta (Facebook/Instagram)",
    description: "Manage Meta ads, publish posts and track social performance.",
    icon: Globe,
    color: "from-blue-500 to-indigo-600",
    category: "Social",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "EAABs...", type: "password" },
      { key: "pageId", label: "Page ID", placeholder: "123456789" },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Publish B2B content and manage LinkedIn company page.",
    icon: Link2,
    color: "from-blue-600 to-blue-800",
    category: "Social",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "AQV...", type: "password" },
      { key: "organizationId", label: "Organization ID", placeholder: "urn:li:organization:..." },
    ],
  },
  {
    id: "telephony",
    name: "Telephony (VoIP)",
    description: "Connect Twilio, Vonage or other VoIP providers for voice and SMS.",
    icon: Phone,
    color: "from-purple-400 to-purple-600",
    category: "Messaging",
    fields: [
      { key: "provider", label: "Provider", placeholder: "twilio / vonage" },
      { key: "accountSid", label: "Account SID", placeholder: "AC..." },
      { key: "authToken", label: "Auth Token", placeholder: "...", type: "password" },
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
