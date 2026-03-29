import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";
import {
  Bot,
  Send,
  User,
  Sparkles,
  BarChart2,
  Users,
  FileText,
  GitBranch,
  Headphones,
  Brain,
  ChevronRight,
  Zap,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

type AgentType = "central" | "crm" | "content" | "funnel" | "support" | "reports";

const AGENTS: { id: AgentType; name: string; description: string; icon: React.ComponentType<{ className?: string }>; color: string; examples: string[] }[] = [
  {
    id: "central",
    name: "Central Guide",
    description: "Your main AI assistant for overall strategy and guidance",
    icon: Brain,
    color: "from-orange-500 to-red-500",
    examples: [
      "How should I start my marketing strategy?",
      "What's the best channel for my business?",
      "Help me prioritize my tasks this week",
    ],
  },
  {
    id: "crm",
    name: "CRM Copilot",
    description: "Manage contacts, suggest follow-ups and score leads",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    examples: [
      "Which contacts should I follow up today?",
      "How do I improve my lead score?",
      "Suggest a reactivation message for lost leads",
    ],
  },
  {
    id: "content",
    name: "Content Copilot",
    description: "Create campaigns, posts and marketing content",
    icon: FileText,
    color: "from-purple-500 to-pink-500",
    examples: [
      "Write an email campaign for my new service",
      "Create 5 Instagram post ideas for my business",
      "Generate a WhatsApp follow-up sequence",
    ],
  },
  {
    id: "funnel",
    name: "Funnel Copilot",
    description: "Build and optimize your sales funnels",
    icon: GitBranch,
    color: "from-green-500 to-emerald-500",
    examples: [
      "What funnel should I use to get more bookings?",
      "How do I improve my landing page conversion?",
      "Suggest a funnel for my consulting business",
    ],
  },
  {
    id: "support",
    name: "Support Copilot",
    description: "Handle customer conversations and suggest responses",
    icon: Headphones,
    color: "from-yellow-500 to-orange-500",
    examples: [
      "How do I respond to an unhappy customer?",
      "Suggest a bot script for common questions",
      "Help me write a FAQ for my business",
    ],
  },
  {
    id: "reports",
    name: "Reports Copilot",
    description: "Analyze your metrics and suggest improvements",
    icon: BarChart2,
    color: "from-indigo-500 to-blue-500",
    examples: [
      "What metrics should I track this month?",
      "How do I interpret my campaign results?",
      "Give me 3 actionable improvements for this week",
    ],
  },
];

type Message = { role: "user" | "assistant"; content: string; timestamp: Date };

function AgentChat({ agentId }: { agentId: AgentType }) {
  const { t, language } = useLanguage();
  const agent = AGENTS.find((a) => a.id === agentId)!;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, timestamp: new Date() }]);
    },
    onError: (e) => {
      toast.error(e.message);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again.", timestamp: new Date() }]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    chat.mutate({
      agentType: agentId,
      message: input.trim(),
      language,
      history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    });
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      {/* Agent header */}
      <div className={cn("p-4 rounded-t-xl bg-gradient-to-r text-white", agent.color)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <agent.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold">{t(`ai.${agentId}`)}</p>
            <p className="text-xs text-white/80">{agent.description}</p>
          </div>
          <Badge className="ml-auto bg-white/20 text-white border-0 text-xs">AI Powered</Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card border-x border-border">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Start a conversation with {t(`ai.${agentId}`)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Try asking:</p>
              {agent.examples.map((example) => (
                <button
                  key={example}
                  onClick={() => setInput(example)}
                  className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-all flex items-center gap-2 group"
                >
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className={cn("text-xs", msg.role === "assistant" ? `bg-gradient-to-br ${agent.color} text-white` : "bg-muted")}>
                  {msg.role === "assistant" ? <agent.icon className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className={cn("max-w-[75%]", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "rounded-2xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                )}>
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    msg.content
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        {chat.isPending && (
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className={cn("text-xs bg-gradient-to-br text-white", agent.color)}>
                <agent.icon className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border border-t-0 border-border rounded-b-xl bg-card">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${t(`ai.${agentId}`)}...`}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            className="flex-1"
          />
          <Button
            className="brand-gradient text-white border-0 gap-2"
            disabled={!input.trim() || chat.isPending}
            onClick={sendMessage}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AIAgents() {
  const { t } = useLanguage();
  const [activeAgent, setActiveAgent] = useState<AgentType>("central");

  const { data: actions = [] } = trpc.ai.listActions.useQuery();

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            {t("ai.title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered copilots to assist with every aspect of your business
          </p>
        </div>

        <Tabs value={activeAgent} onValueChange={(v) => setActiveAgent(v as AgentType)}>
          <div className="flex gap-4 flex-col lg:flex-row">
            {/* Agent selector */}
            <div className="lg:w-56 flex-shrink-0">
              <TabsList className="flex flex-row lg:flex-col h-auto bg-transparent gap-1 p-0 w-full">
                {AGENTS.map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <TabsTrigger
                      key={agent.id}
                      value={agent.id}
                      className={cn(
                        "flex items-center gap-2 w-full justify-start px-3 py-2.5 rounded-lg text-sm data-[state=active]:shadow-sm",
                        "data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                      )}
                    >
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br text-white flex-shrink-0", agent.color)}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="hidden lg:block truncate">{t(`ai.${agent.id}`)}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Pending actions */}
              {(actions as Record<string, unknown>[]).filter((a) => a.status === "pending_approval").length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-xl">
                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Approval ({(actions as Record<string, unknown>[]).filter((a) => a.status === "pending_approval").length})
                  </p>
                  {(actions as Record<string, unknown>[]).filter((a) => a.status === "pending_approval").slice(0, 3).map((action) => (
                    <div key={String(action.id)} className="mb-2 p-2 bg-white dark:bg-gray-900 rounded-lg">
                      <p className="text-xs font-medium truncate">{String(action.action ?? "")}</p>
                      <div className="flex gap-1 mt-1.5">
                        <Button
                          size="sm"
                          className="h-6 text-[10px] brand-gradient text-white border-0 flex-1"
                          onClick={() => toast.success("Action approved!")}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] flex-1"
                          onClick={() => toast.info("Action rejected")}
                        >
                          <XCircle className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat area */}
            <div className="flex-1">
              {AGENTS.map((agent) => (
                <TabsContent key={agent.id} value={agent.id} className="mt-0">
                  <AgentChat agentId={agent.id} />
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
