import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Star,
  ChevronRight,
  Building2,
  GitBranch,
  CheckSquare,
  Bot,
  TrendingUp,
  Clock,
  Filter,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  qualified: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  converted: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  lost: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const PIPELINE_STAGES = [
  { id: "new", color: "bg-blue-500", label: "New Lead" },
  { id: "qualified", color: "bg-purple-500", label: "Qualified" },
  { id: "proposal", color: "bg-yellow-500", label: "Proposal" },
  { id: "negotiation", color: "bg-orange-500", label: "Negotiation" },
  { id: "won", color: "bg-green-500", label: "Won" },
  { id: "lost", color: "bg-red-500", label: "Lost" },
];

function LeadScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-500";
  return (
    <div className={cn("flex items-center gap-1 text-xs font-bold", color)}>
      <Star className="w-3 h-3 fill-current" />
      {score}
    </div>
  );
}

function AddContactDialog({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", whatsapp: "",
    company: "", jobTitle: "", country: "", source: "", notes: "",
  });

  const createContact = trpc.crm.createContact.useMutation({
    onSuccess: () => {
      toast.success("Contact created!");
      setOpen(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", whatsapp: "", company: "", jobTitle: "", country: "", source: "", notes: "" });
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="brand-gradient text-white border-0 gap-2">
          <Plus className="w-4 h-4" />
          {t("crm.addContact")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("crm.addContact")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="space-y-1">
            <Label>First Name *</Label>
            <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="John" />
          </div>
          <div className="space-y-1">
            <Label>Last Name</Label>
            <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Doe" />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 555 0000" />
          </div>
          <div className="space-y-1">
            <Label>WhatsApp</Label>
            <Input value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} placeholder="+1 555 0000" />
          </div>
          <div className="space-y-1">
            <Label>Company</Label>
            <Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Acme Inc." />
          </div>
          <div className="space-y-1">
            <Label>Job Title</Label>
            <Input value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} placeholder="CEO" />
          </div>
          <div className="space-y-1">
            <Label>Source</Label>
            <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}>
              <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
              <SelectContent>
                {["Website", "WhatsApp", "Instagram", "Facebook", "LinkedIn", "Referral", "Cold Call", "Event", "Other"].map((s) => (
                  <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Add any notes..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
          <Button
            className="brand-gradient text-white border-0"
            disabled={!form.firstName || createContact.isPending}
            onClick={() => createContact.mutate(form)}
          >
            {createContact.isPending ? t("common.loading") : t("common.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContactCard({ contact, onRefresh }: { contact: Record<string, unknown>; onRefresh: () => void }) {
  const { t } = useLanguage();
  const deleteContact = trpc.crm.deleteContact.useMutation({
    onSuccess: () => { toast.success("Contact deleted"); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });
  const suggestAction = trpc.crm.suggestNextAction.useMutation({
    onSuccess: (data) => toast.success(`AI Suggestion: ${data.suggestion}`),
    onError: (e) => toast.error(e.message),
  });

  const initials = `${String(contact.firstName ?? "")[0] ?? ""}${String(contact.lastName ?? "")[0] ?? ""}`.toUpperCase() || "?";
  const fullName = `${contact.firstName} ${contact.lastName ?? ""}`.trim();

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all group">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarFallback className="brand-gradient text-white text-sm font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm truncate">{fullName}</p>
            <div className="flex items-center gap-1">
              <LeadScoreBadge score={Number(contact.leadScore) || 0} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => suggestAction.mutate({ contactId: Number(contact.id) })}>
                    <Bot className="w-4 h-4 mr-2" /> AI Next Action
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteContact.mutate({ id: Number(contact.id) })}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> {t("common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {Boolean(contact.company) && <p className="text-xs text-muted-foreground truncate">{String(contact.company)}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Badge className={cn("text-[10px] px-1.5 py-0 h-4", STATUS_COLORS[String(contact.status ?? "new")])}>
              {t(`crm.status.${String(contact.status ?? "new")}`)}
            </Badge>
            {Boolean(contact.nextAction) && (
              <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                <Clock className="w-3 h-3" /> {String(contact.nextAction ?? "").slice(0, 30)}...
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {Boolean(contact.email) && (
              <a href={`mailto:${String(contact.email)}`} className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}
            {Boolean(contact.phone) && (
              <a href={`tel:${String(contact.phone)}`} className="text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}
            {Boolean(contact.whatsapp) && (
              <a href={`https://wa.me/${String(contact.whatsapp).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-green-500 transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineView() {
  const { t } = useLanguage();
  const { data: opportunities = [], refetch } = trpc.crm.listOpportunities.useQuery({});
  const updateStage = trpc.crm.updateOpportunityStage.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });
  const createOpp = trpc.crm.createOpportunity.useMutation({
    onSuccess: () => { toast.success("Opportunity created!"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const [newOppTitle, setNewOppTitle] = useState("");
  const [addingToStage, setAddingToStage] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {PIPELINE_STAGES.map((stage) => {
          const stageOpps = (opportunities as Record<string, unknown>[]).filter((o) => o.stage === stage.id);
          const totalValue = stageOpps.reduce((sum, o) => sum + (parseFloat(String(o.value ?? "0")) || 0), 0);

          return (
            <div key={stage.id} className="w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full", stage.color)} />
                  <span className="text-sm font-semibold">{t(`crm.stages.${stage.id}`)}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{stageOpps.length}</Badge>
                </div>
                {totalValue > 0 && (
                  <span className="text-xs text-muted-foreground">${totalValue.toLocaleString()}</span>
                )}
              </div>

              <div className="space-y-2 min-h-32">
                {stageOpps.map((opp) => (
                  <div key={String(opp.id)} className="bg-card border border-border rounded-lg p-3 hover:shadow-sm transition-all">
                    <p className="text-sm font-medium truncate">{String(opp.title ?? "")}</p>
                    {opp.value != null && <p className="text-xs text-primary font-semibold mt-1">{`$${parseFloat(String(opp.value)).toLocaleString()}`}</p>}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {PIPELINE_STAGES.filter((s) => s.id !== stage.id).slice(0, 2).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => updateStage.mutate({ id: Number(opp.id), stage: s.id })}
                          className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                        >
                          {`→ ${t(`crm.stages.${s.id}`)}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Add card */}
                {addingToStage === stage.id ? (
                  <div className="bg-card border border-primary/30 rounded-lg p-3 space-y-2">
                    <Input
                      value={newOppTitle}
                      onChange={(e) => setNewOppTitle(e.target.value)}
                      placeholder="Opportunity title..."
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newOppTitle) {
                          createOpp.mutate({ title: newOppTitle, stage: stage.id });
                          setNewOppTitle("");
                          setAddingToStage(null);
                        }
                        if (e.key === "Escape") setAddingToStage(null);
                      }}
                    />
                    <div className="flex gap-1">
                      <Button size="sm" className="h-7 text-xs brand-gradient text-white border-0"
                        onClick={() => { if (newOppTitle) { createOpp.mutate({ title: newOppTitle, stage: stage.id }); setNewOppTitle(""); setAddingToStage(null); } }}>
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingToStage(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingToStage(stage.id)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add deal
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CRM() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("contacts");

  const { data: contactsData, refetch: refetchContacts } = trpc.crm.listContacts.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: tasks = [], refetch: refetchTasks } = trpc.crm.listTasks.useQuery({});
  const createTask = trpc.crm.createTask.useMutation({
    onSuccess: () => { toast.success("Task created!"); refetchTasks(); },
    onError: (e) => toast.error(e.message),
  });

  const contacts = (contactsData?.items ?? []) as Record<string, unknown>[];

  const stats = [
    { label: t("crm.contacts"), value: contacts.length, icon: Users, color: "text-blue-500" },
    { label: "Qualified", value: contacts.filter((c) => c.status === "qualified").length, icon: TrendingUp, color: "text-purple-500" },
    { label: "Converted", value: contacts.filter((c) => c.status === "converted").length, icon: CheckSquare, color: "text-green-500" },
    { label: "Tasks Today", value: (tasks as Record<string, unknown>[]).filter((t) => t.status === "pending").length, icon: Clock, color: "text-orange-500" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("crm.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("common.noData") === "Sem dados ainda"
                ? "Gerencie seus contatos, oportunidades e tarefas"
                : "Manage your contacts, opportunities and tasks"}
            </p>
          </div>
          <AddContactDialog onSuccess={refetchContacts} />
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="contacts" className="gap-2">
              <Users className="w-4 h-4" /> {t("crm.contacts")}
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <GitBranch className="w-4 h-4" /> {t("crm.pipeline")}
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="w-4 h-4" /> {t("crm.tasks")}
            </TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="mt-4 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`${t("common.search")} contacts...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {["new", "contacted", "qualified", "converted", "lost", "inactive"].map((s) => (
                    <SelectItem key={s} value={s}>{t(`crm.status.${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground">{t("common.noData")}</p>
                <AddContactDialog onSuccess={refetchContacts} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {contacts.map((contact) => (
                  <ContactCard key={String(contact.id)} contact={contact} onRefresh={refetchContacts} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="mt-4">
            <PipelineView />
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{t("crm.tasks")}</h3>
              <Button
                size="sm"
                className="brand-gradient text-white border-0 gap-2"
                onClick={() => createTask.mutate({ title: "New Task", priority: "medium" })}
              >
                <Plus className="w-4 h-4" /> {t("crm.addTask")}
              </Button>
            </div>
            {(tasks as Record<string, unknown>[]).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{t("common.noData")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(tasks as Record<string, unknown>[]).map((task) => (
                  <div key={String(task.id)} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <input type="checkbox" className="rounded" checked={task.status === "done"} readOnly />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{String(task.title ?? "")}</p>
                      {Boolean(task.dueAt) && <p className="text-xs text-muted-foreground">{new Date(String(task.dueAt ?? "")).toLocaleDateString()}</p>}
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">{String(task.priority ?? "medium")}</Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
