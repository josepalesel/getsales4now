import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Inbox,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  Mic,
  Bot,
  User,
  Send,
  CheckCheck,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Zap,
  Languages,
} from "lucide-react";

const CHANNEL_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  whatsapp: { icon: MessageSquare, color: "text-green-500 bg-green-50 dark:bg-green-950", label: "WhatsApp" },
  email: { icon: Mail, color: "text-blue-500 bg-blue-50 dark:bg-blue-950", label: "Email" },
  sms: { icon: Phone, color: "text-purple-500 bg-purple-50 dark:bg-purple-950", label: "SMS" },
  webchat: { icon: Globe, color: "text-orange-500 bg-orange-50 dark:bg-orange-950", label: "Web Chat" },
  voice: { icon: Mic, color: "text-red-500 bg-red-50 dark:bg-red-950", label: "Voice" },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  open: { color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300", label: "Open" },
  pending: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300", label: "Pending" },
  resolved: { color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", label: "Resolved" },
  bot: { color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", label: "Bot" },
};

function ConversationItem({
  conv,
  selected,
  onClick,
}: {
  conv: Record<string, unknown>;
  selected: boolean;
  onClick: () => void;
}) {
  const channel = String(conv.channel ?? "webchat");
  const channelConf = CHANNEL_CONFIG[channel] ?? CHANNEL_CONFIG.webchat;
  const ChannelIcon = channelConf.icon;
  const status = String(conv.status ?? "open");
  const statusConf = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg transition-all hover:bg-muted/50 border",
        selected ? "bg-primary/5 border-primary/30" : "border-transparent"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", channelConf.color)}>
          <ChannelIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold truncate">
              {conv.contactId ? `Contact #${conv.contactId}` : "Anonymous"}
            </p>
            <Badge className={cn("text-[9px] px-1.5 py-0 h-4 flex-shrink-0", statusConf.color)}>
              {statusConf.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{channelConf.label}</p>
          {Boolean(conv.intentLabel) && (
            <p className="text-[10px] text-primary mt-0.5 truncate">Intent: {String(conv.intentLabel)}</p>
          )}
          {Boolean(conv.lastMessageAt) && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {new Date(String(conv.lastMessageAt)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg }: { msg: Record<string, unknown> }) {
  const role = String(msg.role ?? "user");
  const isAgent = role === "agent" || role === "bot" || role === "system";

  return (
    <div className={cn("flex gap-2 max-w-[80%]", isAgent ? "ml-auto flex-row-reverse" : "mr-auto")}>
      <Avatar className="w-7 h-7 flex-shrink-0">
        <AvatarFallback className={cn("text-xs", isAgent ? "brand-gradient text-white" : "bg-muted")}>
          {role === "bot" ? <Bot className="w-3.5 h-3.5" /> : isAgent ? <User className="w-3.5 h-3.5" /> : "U"}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className={cn(
          "rounded-2xl px-3 py-2 text-sm",
          isAgent
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}>
          {String(msg.content ?? "")}
        </div>
        {Boolean(msg.suggestedReply) && (
          <p className="text-[10px] text-muted-foreground mt-1 italic">
            Suggested: {String(msg.suggestedReply).slice(0, 60)}...
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {new Date(String(msg.sentAt ?? Date.now())).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const { t } = useLanguage();
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const { data: conversations = [], refetch: refetchConvs } = trpc.inbox.listConversations.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    channel: channelFilter !== "all" ? channelFilter : undefined,
  });

  const { data: messages = [], refetch: refetchMessages } = trpc.inbox.getMessages.useQuery(
    { conversationId: selectedConvId! },
    { enabled: selectedConvId !== null }
  );

  const sendMessage = trpc.inbox.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
    },
    onError: (e) => toast.error(e.message),
  });

  const createConversation = trpc.inbox.createConversation.useMutation({
    onSuccess: (data) => {
      toast.success("Conversation created!");
      refetchConvs();
      if (data && typeof data === "object" && "id" in data) {
        setSelectedConvId(Number(data.id));
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const convList = (conversations as Record<string, unknown>[]).filter((c) => {
    if (!searchQuery) return true;
    return String(c.intentLabel ?? "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConv = (conversations as Record<string, unknown>[]).find((c) => Number(c.id) === selectedConvId);

  const stats = [
    { label: "Open", value: (conversations as Record<string, unknown>[]).filter((c) => c.status === "open").length, icon: Inbox, color: "text-green-500" },
    { label: "Pending", value: (conversations as Record<string, unknown>[]).filter((c) => c.status === "pending").length, icon: Clock, color: "text-yellow-500" },
    { label: "Bot Active", value: (conversations as Record<string, unknown>[]).filter((c) => c.status === "bot").length, icon: Bot, color: "text-blue-500" },
    { label: "Resolved", value: (conversations as Record<string, unknown>[]).filter((c) => c.status === "resolved").length, icon: CheckCheck, color: "text-gray-500" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("inbox.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Unified inbox for WhatsApp, Email, SMS and Web Chat
            </p>
          </div>
          <Button
            className="brand-gradient text-white border-0 gap-2"
            onClick={() => createConversation.mutate({ channel: "webchat" })}
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center", stat.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main inbox layout */}
        <div className="flex gap-4 h-[calc(100vh-320px)] min-h-[400px]">
          {/* Conversation list */}
          <div className="w-72 flex-shrink-0 flex flex-col gap-2">
            {/* Filters */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {["open", "pending", "resolved", "bot"].map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {Object.entries(CHANNEL_CONFIG).map(([key, conf]) => (
                    <SelectItem key={key} value={key}>{conf.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {convList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{t("common.noData")}</p>
                </div>
              ) : (
                convList.map((conv) => (
                  <ConversationItem
                    key={String(conv.id)}
                    conv={conv}
                    selected={selectedConvId === Number(conv.id)}
                    onClick={() => setSelectedConvId(Number(conv.id))}
                  />
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
            {selectedConv ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const ch = String(selectedConv.channel ?? "webchat");
                      const conf = CHANNEL_CONFIG[ch] ?? CHANNEL_CONFIG.webchat;
                      const Icon = conf.icon;
                      return (
                        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", conf.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                      );
                    })()}
                    <div>
                      <p className="font-semibold text-sm">
                        {selectedConv.contactId ? `Contact #${selectedConv.contactId}` : "Anonymous Visitor"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {CHANNEL_CONFIG[String(selectedConv.channel ?? "webchat")]?.label}
                        {Boolean(selectedConv.detectedLanguage) && (
                          <><Languages className="w-3 h-3 ml-1" /> {String(selectedConv.detectedLanguage)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", STATUS_CONFIG[String(selectedConv.status ?? "open")]?.color)}>
                      {STATUS_CONFIG[String(selectedConv.status ?? "open")]?.label}
                    </Badge>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <Bot className="w-3.5 h-3.5" /> AI Assist
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {(messages as Record<string, unknown>[]).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No messages yet</p>
                    </div>
                  ) : (
                    (messages as Record<string, unknown>[]).map((msg) => (
                      <MessageBubble key={String(msg.id)} msg={msg} />
                    ))
                  )}
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      rows={2}
                      className="resize-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (newMessage.trim()) {
                            sendMessage.mutate({
                              conversationId: selectedConvId!,
                              content: newMessage.trim(),
                            });
                          }
                        }
                      }}
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        className="brand-gradient text-white border-0 h-full"
                        disabled={!newMessage.trim() || sendMessage.isPending}
                        onClick={() => {
                          if (newMessage.trim()) {
                            sendMessage.mutate({
                              conversationId: selectedConvId!,
                              content: newMessage.trim(),
                            });
                          }
                        }}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Press Enter to send, Shift+Enter for new line</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-3">
                <Inbox className="w-12 h-12 opacity-20" />
                <p className="text-sm">Select a conversation to start</p>
                <p className="text-xs">or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
