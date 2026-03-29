import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";
import {
  BarChart2,
  TrendingUp,
  Users,
  Target,
  Megaphone,
  MessageSquare,
  Bot,
  Zap,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

const MOCK_MONTHLY = [
  { month: "Oct", leads: 12, conversions: 3, revenue: 4500, campaigns: 2 },
  { month: "Nov", leads: 18, conversions: 5, revenue: 6800, campaigns: 3 },
  { month: "Dec", leads: 14, conversions: 4, revenue: 5200, campaigns: 2 },
  { month: "Jan", leads: 22, conversions: 7, revenue: 9100, campaigns: 4 },
  { month: "Feb", leads: 28, conversions: 9, revenue: 11500, campaigns: 5 },
  { month: "Mar", leads: 35, conversions: 12, revenue: 15800, campaigns: 6 },
];

const MOCK_CAMPAIGNS = [
  { name: "Email - Services", sent: 450, opened: 189, clicked: 67, converted: 12 },
  { name: "WhatsApp - Promo", sent: 280, opened: 241, clicked: 98, converted: 23 },
  { name: "SMS - Reminder", sent: 150, opened: 142, clicked: 45, converted: 8 },
  { name: "Email - Newsletter", sent: 620, opened: 198, clicked: 42, converted: 6 },
];

const MOCK_CHANNELS = [
  { channel: "WhatsApp", conversations: 45, resolved: 38, avgTime: "4m" },
  { channel: "Email", conversations: 28, resolved: 25, avgTime: "12m" },
  { channel: "Web Chat", conversations: 19, resolved: 16, avgTime: "6m" },
  { channel: "SMS", conversations: 12, resolved: 11, avgTime: "8m" },
];

export default function Reports() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const { data: stats } = trpc.reports.getDashboardStats.useQuery();
  const getAISummary = trpc.reports.getAISummary.useMutation({
    onSuccess: (data) => setAiSummary(data.summary),
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("reports.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track your business performance with actionable insights
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => getAISummary.mutate({ language })}
              disabled={getAISummary.isPending}
            >
              {getAISummary.isPending ? (
                <><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Analyzing...</>
              ) : (
                <><Bot className="w-4 h-4" /> AI Analysis</>
              )}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                AI Performance Analysis
                <Badge className="bg-primary/10 text-primary border-0 text-xs ml-auto">AI Generated</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <Streamdown>{aiSummary}</Streamdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("dashboard.totalContacts"), value: stats?.totalContacts ?? 0, icon: Users, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950" },
            { label: t("dashboard.openOpportunities"), value: stats?.openOpportunities ?? 0, icon: Target, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
            { label: t("dashboard.activeCampaigns"), value: stats?.activeCampaigns ?? 0, icon: Megaphone, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
            { label: t("dashboard.openConversations"), value: stats?.openConversations ?? 0, icon: MessageSquare, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg, color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Leads & Revenue trend */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Leads & Revenue Trend (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={MOCK_MONTHLY} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="leadsGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Area type="monotone" dataKey="leads" stroke="#f97316" strokeWidth={2} fill="url(#leadsGrad2)" name="Leads" />
                    <Area type="monotone" dataKey="conversions" stroke="#3b82f6" strokeWidth={2} fill="none" name="Conversions" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly metrics table */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  Monthly Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Month", "Leads", "Conversions", "Conv. Rate", "Revenue", "Campaigns"].map((h) => (
                          <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_MONTHLY.map((row) => (
                        <tr key={row.month} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-2 px-3 font-medium">{row.month}</td>
                          <td className="py-2 px-3">{row.leads}</td>
                          <td className="py-2 px-3">{row.conversions}</td>
                          <td className="py-2 px-3">
                            <Badge className={cn("text-[10px]", row.conversions / row.leads > 0.3 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                              {((row.conversions / row.leads) * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="py-2 px-3 font-semibold text-green-600">
                            ${row.revenue.toLocaleString()}
                          </td>
                          <td className="py-2 px-3">{row.campaigns}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-4 space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" />
                  Campaign Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={MOCK_CAMPAIGNS} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="sent" fill="#e2e8f0" name="Sent" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="opened" fill="#f97316" name="Opened" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="clicked" fill="#3b82f6" name="Clicked" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="converted" fill="#10b981" name="Converted" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Campaign", "Sent", "Open Rate", "Click Rate", "Conv. Rate"].map((h) => (
                          <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_CAMPAIGNS.map((c) => (
                        <tr key={c.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-2 px-3 font-medium text-xs">{c.name}</td>
                          <td className="py-2 px-3">{c.sent}</td>
                          <td className="py-2 px-3">
                            <Badge className="bg-orange-100 text-orange-700 text-[10px]">
                              {((c.opened / c.sent) * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="py-2 px-3">
                            <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                              {((c.clicked / c.sent) * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="py-2 px-3">
                            <Badge className="bg-green-100 text-green-700 text-[10px]">
                              {((c.converted / c.sent) * 100).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inbox" className="mt-4 space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Inbox Performance by Channel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Channel", "Conversations", "Resolved", "Resolution Rate", "Avg. Response Time"].map((h) => (
                          <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_CHANNELS.map((c) => (
                        <tr key={c.channel} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-2 px-3 font-medium">{c.channel}</td>
                          <td className="py-2 px-3">{c.conversations}</td>
                          <td className="py-2 px-3">{c.resolved}</td>
                          <td className="py-2 px-3">
                            <Badge className={cn("text-[10px]", c.resolved / c.conversations > 0.85 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                              {((c.resolved / c.conversations) * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="py-2 px-3 font-medium">{c.avgTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
