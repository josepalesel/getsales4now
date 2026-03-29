import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Users,
  Target,
  Megaphone,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Bot,
  ChevronRight,
  Zap,
  BarChart2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link } from "wouter";

const CHART_COLORS = ["#f97316", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6"];

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href?: string;
}) {
  const isPositive = (change ?? 0) > 0;
  const isNeutral = change === 0 || change === undefined;

  return (
    <Card className="border-border hover:shadow-md transition-all group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {href && (
            <Link href={href}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
        </div>
        {!isNeutral && (
          <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", isPositive ? "text-green-600" : "text-red-500")}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isPositive ? "+" : ""}{change}% this month
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const MOCK_LEADS_DATA = [
  { month: "Oct", leads: 12, conversions: 3 },
  { month: "Nov", leads: 18, conversions: 5 },
  { month: "Dec", leads: 14, conversions: 4 },
  { month: "Jan", leads: 22, conversions: 7 },
  { month: "Feb", leads: 28, conversions: 9 },
  { month: "Mar", leads: 35, conversions: 12 },
];

const MOCK_CHANNELS_DATA = [
  { name: "WhatsApp", value: 42 },
  { name: "Email", value: 28 },
  { name: "Web Chat", value: 18 },
  { name: "SMS", value: 12 },
];

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { data: stats } = trpc.reports.getDashboardStats.useQuery();
  const { data: aiInsight, mutate: fetchAIInsight } = trpc.reports.getAISummary.useMutation();

  const statCards = [
    {
      title: t("dashboard.totalContacts"),
      value: stats?.totalContacts ?? 0,
      change: 12,
      icon: Users,
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
      href: "/crm",
    },
    {
      title: t("dashboard.openOpportunities"),
      value: stats?.openOpportunities ?? 0,
      change: 8,
      icon: Target,
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
      href: "/crm",
    },
    {
      title: t("dashboard.activeCampaigns"),
      value: stats?.activeCampaigns ?? 0,
      change: 5,
      icon: Megaphone,
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
      href: "/campaigns",
    },
    {
      title: t("dashboard.openConversations"),
      value: stats?.openConversations ?? 0,
      change: -3,
      icon: MessageSquare,
      color: "bg-gradient-to-br from-green-400 to-green-600",
      href: "/inbox",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date().toLocaleDateString(language === "pt" ? "pt-BR" : language === "es" ? "es-419" : "en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Link href="/ai">
            <Button className="brand-gradient text-white border-0 gap-2">
              <Bot className="w-4 h-4" />
              {t("ai.central")}
            </Button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Leads over time */}
          <Card className="border-border lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t("dashboard.leadsOverTime")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MOCK_LEADS_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                  <Area type="monotone" dataKey="leads" stroke="#f97316" strokeWidth={2} fill="url(#leadsGrad)" name="Leads" />
                  <Area type="monotone" dataKey="conversions" stroke="#3b82f6" strokeWidth={2} fill="url(#convGrad)" name="Conversions" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  Leads
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  Conversions
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Channels distribution */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                {t("dashboard.channelDistribution")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={MOCK_CHANNELS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {MOCK_CHANNELS_DATA.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-1">
                {MOCK_CHANNELS_DATA.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insight + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* AI Summary */}
          <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                {t("dashboard.aiInsights")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiInsight?.summary ? (
                <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                  {aiInsight.summary}
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { icon: CheckCircle2, text: "3 contacts need follow-up today", color: "text-green-500" },
                    { icon: AlertCircle, text: "2 campaigns have low open rates", color: "text-yellow-500" },
                    { icon: Zap, text: "Consider reactivating 5 cold leads", color: "text-blue-500" },
                  ].map(({ icon: Icon, text, color }) => (
                    <div key={text} className="flex items-start gap-2 text-sm">
                      <Icon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", color)} />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/ai">
                <Button variant="outline" size="sm" className="mt-3 h-7 text-xs gap-1.5 w-full">
                  <Bot className="w-3.5 h-3.5" />
                  Ask AI for more insights
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                {t("dashboard.quickActions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: t("dashboard.addContact"), href: "/crm", icon: Users, color: "bg-orange-50 dark:bg-orange-950 text-orange-600" },
                  { label: t("dashboard.createCampaign"), href: "/campaigns", icon: Megaphone, color: "bg-purple-50 dark:bg-purple-950 text-purple-600" },
                  { label: t("dashboard.createPost"), href: "/social", icon: BarChart2, color: "bg-blue-50 dark:bg-blue-950 text-blue-600" },
                  { label: t("dashboard.viewInbox"), href: "/inbox", icon: MessageSquare, color: "bg-green-50 dark:bg-green-950 text-green-600" },
                ].map(({ label, href, icon: Icon, color }) => (
                  <Link key={href} href={href}>
                    <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-all group text-left">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium flex-1">{label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {t("dashboard.recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { text: "New lead from landing page: Maria Silva", time: "2 min ago", type: "lead", color: "bg-green-500" },
                { text: "Campaign 'Black Friday' reached 1,200 contacts", time: "1 hour ago", type: "campaign", color: "bg-purple-500" },
                { text: "WhatsApp conversation resolved with João Santos", time: "3 hours ago", type: "inbox", color: "bg-blue-500" },
                { text: "Funnel 'Consultation Booking' converted 3 leads", time: "5 hours ago", type: "funnel", color: "bg-orange-500" },
              ].map(({ text, time, color }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
