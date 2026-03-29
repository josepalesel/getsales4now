import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  GitBranch,
  Plus,
  Bot,
  Play,
  Pause,
  Archive,
  Users,
  Target,
  TrendingUp,
  ChevronRight,
  Globe,
  FileText,
  Calendar,
  Zap,
  ArrowRight,
  BarChart2,
} from "lucide-react";

const FUNNEL_TEMPLATES = [
  { id: "lead_capture", name: "Lead Capture", icon: Users, description: "Capture leads with a landing page + form", steps: ["Landing Page", "Lead Form", "Thank You Page", "Email Sequence"] },
  { id: "webinar", name: "Webinar Registration", icon: Calendar, description: "Register attendees for online events", steps: ["Registration Page", "Confirmation Email", "Reminder Sequence", "Replay Page"] },
  { id: "product_launch", name: "Product Launch", icon: Zap, description: "Launch a product with urgency and scarcity", steps: ["Pre-launch Page", "Sales Page", "Checkout", "Upsell", "Thank You"] },
  { id: "consultation", name: "Book Consultation", icon: Calendar, description: "Book discovery calls or consultations", steps: ["Landing Page", "Booking Page", "Confirmation", "Reminder Sequence"] },
  { id: "content_upgrade", name: "Content Upgrade", icon: FileText, description: "Offer a free resource in exchange for email", steps: ["Content Page", "Opt-in Form", "Delivery Email", "Nurture Sequence"] },
  { id: "ecommerce", name: "E-commerce", icon: Globe, description: "Sell products online with upsells", steps: ["Product Page", "Cart", "Checkout", "Upsell", "Order Confirmation"] },
];

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  draft: { color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", label: "Draft" },
  active: { color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300", label: "Active" },
  paused: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300", label: "Paused" },
  archived: { color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500", label: "Archived" },
};

function CreateFunnelDialog({ onSuccess }: { onSuccess: () => void }) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", objective: "", niche: "services", language });
  const [aiContent, setAiContent] = useState<{ headline: string; subheadline: string; body: string; cta_button_text: string } | null>(null);

  const createFunnel = trpc.funnels.create.useMutation({
    onSuccess: () => {
      toast.success("Funnel created!");
      setOpen(false);
      setStep(1);
      setSelectedTemplate(null);
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  const generateContent = trpc.funnels.generateCopy.useMutation({
    onSuccess: (data) => {
      setAiContent(data);
      toast.success("Landing page content generated!");
    },
    onError: (e) => toast.error(e.message),
  });

  const template = FUNNEL_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="brand-gradient text-white border-0 gap-2">
          <Plus className="w-4 h-4" />
          {t("funnels.create")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("funnels.create")}</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">Choose a funnel template to get started quickly:</p>
            <div className="grid grid-cols-2 gap-3">
              {FUNNEL_TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all hover:shadow-sm",
                      selectedTemplate === tmpl.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", selectedTemplate === tmpl.id ? "brand-gradient" : "bg-muted")}>
                        <Icon className={cn("w-4 h-4", selectedTemplate === tmpl.id ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <span className="font-semibold text-sm">{tmpl.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{tmpl.description}</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {tmpl.steps.map((s, i) => (
                        <span key={s} className="flex items-center gap-1">
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{s}</span>
                          {i < tmpl.steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
              <Button
                className="brand-gradient text-white border-0"
                disabled={!selectedTemplate}
                onClick={() => setStep(2)}
              >
                {t("common.next")}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && template && (
          <div className="space-y-4 mt-2">
            <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3">
              <template.icon className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">{template.name}</p>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Funnel Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={`e.g. ${template.name} - Q1 2025`}
              />
            </div>

            <div className="space-y-1">
              <Label>Business Niche</Label>
              <Select value={form.niche} onValueChange={(v) => setForm((f) => ({ ...f, niche: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["services", "health", "beauty", "realestate", "insurance", "legal", "accounting"].map((n) => (
                    <SelectItem key={n} value={n}>{t(`onboarding.businessTypes.${n}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI Content Preview */}
            {aiContent ? (
              <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> AI-Generated Landing Page Content
                </p>
                <p className="font-bold text-sm">{aiContent.headline}</p>
                <p className="text-sm text-muted-foreground">{aiContent.subheadline}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{aiContent.body}</p>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  {aiContent.cta_button_text}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2 border-primary text-primary hover:bg-primary/5"
                disabled={!form.name || generateContent.isPending}
                onClick={() => generateContent.mutate({
                  funnelId: 0,
                  stepType: "landing_page",
                  objective: template.id,
                  niche: form.niche,
                  language: form.language,
                })}
              >
                {generateContent.isPending ? (
                  <><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><Bot className="w-4 h-4" /> Generate Landing Page Content with AI</>
                )}
              </Button>
            )}

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>{t("common.back")}</Button>
              <Button
                className="brand-gradient text-white border-0"
                disabled={!form.name || createFunnel.isPending}
                onClick={() => createFunnel.mutate({
                  name: form.name,
                  objective: template.id,
                  niche: form.niche,
                  language: form.language,
                })}
              >
                {createFunnel.isPending ? t("common.loading") : t("common.save")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FunnelCard({ funnel, onRefresh }: { funnel: Record<string, unknown>; onRefresh: () => void }) {
  const { t } = useLanguage();
  const status = String(funnel.status ?? "draft");
  const statusConf = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const steps = (funnel.steps as { id: string; name: string; type: string; conversionRate?: number }[]) ?? [];
  const stats = funnel.stats as { visitors: number; leads: number; conversions: number } | null;

  // Status update placeholder

  return (
    <Card className="border-border hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center flex-shrink-0">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-sm truncate">{String(funnel.name ?? "")}</CardTitle>
          </div>
          <Badge className={cn("text-[10px] px-2 py-0.5 flex-shrink-0", statusConf.color)}>
            {statusConf.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Funnel steps visualization */}
        {steps.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {steps.map((step, i) => (
              <span key={step.id} className="flex items-center gap-1">
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded truncate max-w-[80px]">{step.name}</span>
                {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 p-2 bg-muted/50 rounded-lg">
            {[
              { label: "Visitors", value: stats.visitors, icon: Users },
              { label: "Leads", value: stats.leads, icon: Target },
              { label: "Converted", value: stats.conversions, icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <p className="text-sm font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Conversion rate */}
        {stats && stats.visitors > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Conversion Rate</span>
            <span className="font-bold text-primary">
              {((stats.conversions / stats.visitors) * 100).toFixed(1)}%
            </span>
          </div>
        )}

        <div className="flex gap-2">
          {status === "draft" && (
            <Button
              size="sm"
              className="flex-1 h-7 text-xs brand-gradient text-white border-0"
              onClick={() => toast.info("Feature coming soon")}
            >
              <Play className="w-3 h-3 mr-1" /> Activate
            </Button>
          )}
          {status === "active" && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
              onClick={() => toast.info("Feature coming soon")}
            >
              <Pause className="w-3 h-3 mr-1" /> Pause
            </Button>
          )}
          {status === "paused" && (
            <Button
              size="sm"
              className="flex-1 h-7 text-xs brand-gradient text-white border-0"
              onClick={() => toast.info("Feature coming soon")}
            >
              <Play className="w-3 h-3 mr-1" /> Resume
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
            <BarChart2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Funnels() {
  const { t } = useLanguage();
  const { data: funnels = [], refetch } = trpc.funnels.list.useQuery();

  const stats = [
    { label: "Total Funnels", value: (funnels as Record<string, unknown>[]).length, icon: GitBranch, color: "text-primary" },
    { label: "Active", value: (funnels as Record<string, unknown>[]).filter((f) => f.status === "active").length, icon: Play, color: "text-green-500" },
    { label: "Total Visitors", value: (funnels as Record<string, unknown>[]).reduce((s, f) => s + ((f.stats as Record<string, number> | null)?.visitors ?? 0), 0), icon: Users, color: "text-blue-500" },
    { label: "Conversions", value: (funnels as Record<string, unknown>[]).reduce((s, f) => s + ((f.stats as Record<string, number> | null)?.conversions ?? 0), 0), icon: Target, color: "text-orange-500" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("funnels.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Build guided sales funnels with landing pages, forms and booking pages
            </p>
          </div>
          <CreateFunnelDialog onSuccess={refetch} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg bg-muted flex items-center justify-center", stat.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Funnels list */}
        {(funnels as Record<string, unknown>[]).length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <GitBranch className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">{t("common.noData")}</p>
            <p className="text-sm text-muted-foreground">Create your first funnel from a template</p>
            <CreateFunnelDialog onSuccess={refetch} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(funnels as Record<string, unknown>[]).map((funnel) => (
              <FunnelCard key={String(funnel.id)} funnel={funnel} onRefresh={refetch} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
