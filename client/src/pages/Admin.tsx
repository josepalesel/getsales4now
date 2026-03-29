import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Shield,
  Users,
  Settings,
  FileText,
  Activity,
  Search,
  Crown,
  UserX,
  UserCheck,
  Trash2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  Database,
  Zap,
  Globe,
  Lock,
  Mail,
  MessageSquare,
  BarChart2,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  Filter,
  Plug,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminUser = {
  id: number;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  businessType: string | null;
  businessName: string | null;
  uiLanguage: string;
  country: string | null;
  onboardingCompleted: boolean;
  createdAt: Date;
  lastSignedIn: Date;
};

type AppSetting = {
  id: number;
  key: string;
  value: string | null;
  type: "string" | "boolean" | "number" | "json";
  label: string | null;
  description: string | null;
  category: string | null;
};

// ─── SUSPEND BUTTON ─────────────────────────────────────────────────────────
function SuspendButton({ userId, loginMethod, refetch }: { userId: number; loginMethod: string | null; refetch: () => void }) {
  const isSuspended = (loginMethod ?? "").startsWith("suspended:");
  const suspendUser = trpc.admin.suspendUser.useMutation({
    onSuccess: () => {
      toast.success(isSuspended ? "User unsuspended" : "User suspended");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Button
      size="sm"
      variant="outline"
      className={`gap-1.5 text-xs ${isSuspended ? "text-green-600 border-green-200 hover:bg-green-50" : "text-yellow-600 border-yellow-200 hover:bg-yellow-50"}`}
      disabled={suspendUser.isPending}
      onClick={() => suspendUser.mutate({ userId, suspended: !isSuspended })}
    >
      {isSuspended ? <><UserCheck className="w-3.5 h-3.5" /> Unsuspend</> : <><UserX className="w-3.5 h-3.5" /> Suspend</>}
    </Button>
  );
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, refetch } = trpc.admin.listUsers.useQuery({ search, role: roleFilter, page: 1, limit: 50 });
  const users = (data?.users ?? []) as AdminUser[];

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated successfully"); refetch(); setDetailOpen(false); },
    onError: (e) => toast.error(e.message),
  });

  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess: () => { toast.success("User deleted"); refetch(); setDetailOpen(false); },
    onError: (e) => toast.error(e.message),
  });

  const { data: detail } = trpc.admin.getUserDetail.useQuery(
    { userId: selectedUser?.id ?? 0 },
    { enabled: !!selectedUser && detailOpen }
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
          <SelectTrigger className="w-36 h-9">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="h-9 px-3 text-sm font-medium">
          {users.length} users
        </Badge>
      </div>

      {/* Users Table */}
      <Card className="border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["User", "Role", "Business", "Language", "Onboarding", "Last Active", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
                          user.role === "admin" ? "bg-gradient-to-br from-orange-400 to-red-500" : "bg-gradient-to-br from-blue-400 to-blue-600"
                        )}>
                          {(user.name ?? user.email ?? "?")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{user.email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={cn(
                        "text-xs font-semibold",
                        user.role === "admin"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      )}>
                        {user.role === "admin" ? <Crown className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{user.businessName ?? "—"}</p>
                      {user.businessType && (
                        <p className="text-xs text-muted-foreground capitalize">{user.businessType}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs uppercase">{user.uiLanguage}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {user.onboardingCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(user.lastSignedIn).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1"
                        onClick={() => { setSelectedUser(user); setDetailOpen(true); }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white",
                selectedUser?.role === "admin" ? "bg-gradient-to-br from-orange-400 to-red-500" : "bg-gradient-to-br from-blue-400 to-blue-600"
              )}>
                {(selectedUser?.name ?? selectedUser?.email ?? "?")[0]?.toUpperCase()}
              </div>
              {selectedUser?.name ?? selectedUser?.email}
            </DialogTitle>
          </DialogHeader>

          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Email", value: detail.user.email ?? "—" },
                  { label: "Role", value: detail.user.role },
                  { label: "Business", value: detail.user.businessName ?? "—" },
                  { label: "Type", value: detail.user.businessType ?? "—" },
                  { label: "Country", value: detail.user.country ?? "—" },
                  { label: "Language", value: detail.user.uiLanguage?.toUpperCase() },
                  { label: "Contacts", value: String(detail.contactCount) },
                  { label: "Campaigns", value: String(detail.campaignCount) },
                  { label: "Member since", value: new Date(detail.user.createdAt).toLocaleDateString() },
                  { label: "Last sign in", value: new Date(detail.user.lastSignedIn).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/30 rounded-lg p-2.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium mt-0.5 capitalize">{value}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    disabled={updateRole.isPending}
                    onClick={() => updateRole.mutate({
                      userId: selectedUser!.id,
                      role: selectedUser!.role === "admin" ? "user" : "admin",
                    })}
                  >
                    {selectedUser?.role === "admin" ? (
                      <><UserX className="w-3.5 h-3.5" /> Remove Admin</>
                    ) : (
                      <><Crown className="w-3.5 h-3.5 text-orange-500" /> Make Admin</>
                    )}
                  </Button>
                  <SuspendButton userId={selectedUser!.id} loginMethod={detail.user.loginMethod} refetch={refetch} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    disabled={deleteUser.isPending}
                    onClick={() => {
                      if (confirm(`Delete user ${selectedUser?.name ?? selectedUser?.email}? This cannot be undone.`)) {
                        deleteUser.mutate({ userId: selectedUser!.id });
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete User
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── PERMISSIONS TAB ──────────────────────────────────────────────────────────
function PermissionsTab() {
  const { data: matrix = [] } = trpc.admin.getPermissionsMatrix.useQuery();

  const moduleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Dashboard: BarChart2,
    CRM: Users,
    Campaigns: Mail,
    "Social Media": Globe,
    Funnels: Zap,
    Inbox: MessageSquare,
    "AI Copilots": Activity,
    Reports: FileText,
    Integrations: Server,
    "Admin Panel": Shield,
    "User Management": Users,
    "App Settings": Settings,
    "Audit Logs": FileText,
    "System Health": Activity,
  };

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Role Permissions Matrix
          </CardTitle>
          <CardDescription className="text-xs">
            Overview of what each role can access. Contact your developer to modify permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Module</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    <div className="flex items-center justify-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> User
                    </div>
                  </th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-orange-600 uppercase tracking-wide">
                    <div className="flex items-center justify-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" /> Admin
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(matrix as { module: string; user: boolean; admin: boolean }[]).map((row, i) => {
                  const Icon = moduleIcons[row.module] ?? Shield;
                  const isAdminOnly = !row.user && row.admin;
                  return (
                    <tr key={row.module} className={cn(
                      "border-b border-border/50 transition-colors",
                      isAdminOnly ? "bg-orange-50/30 dark:bg-orange-950/20" : "hover:bg-muted/20"
                    )}>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center",
                            isAdminOnly ? "bg-orange-100 dark:bg-orange-950" : "bg-muted"
                          )}>
                            <Icon className={cn("w-3.5 h-3.5", isAdminOnly ? "text-orange-600" : "text-muted-foreground")} />
                          </div>
                          <span className="font-medium text-sm">{row.module}</span>
                          {isAdminOnly && (
                            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-0 text-[10px] h-4 px-1.5">
                              Admin Only
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.user ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.admin ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border border-orange-200 dark:border-orange-900 bg-orange-50/30 dark:bg-orange-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Role Assignment</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              To promote a user to Admin, go to the Users tab, select the user, and click "Make Admin". Admin users have full access to all platform features including this Admin Panel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  general: Globe,
  system: Server,
  limits: BarChart2,
  contact: MessageSquare,
  email: Mail,
  features: Zap,
  analytics: Activity,
  security: Lock,
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  system: "System",
  limits: "Usage Limits",
  contact: "Contact Info",
  email: "Email",
  features: "Feature Flags",
  analytics: "Analytics",
  security: "Security",
};

function SettingsTab() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const { data: settings = [], refetch } = trpc.admin.listSettings.useQuery({ category: activeCategory });
  const allSettings = (settings as AppSetting[]);

  const updateSetting = trpc.admin.updateSetting.useMutation({
    onSuccess: (_, vars) => {
      toast.success("Setting saved");
      setSaving(null);
      setEditedValues((prev) => { const n = { ...prev }; delete n[vars.key]; return n; });
      refetch();
    },
    onError: (e) => { toast.error(e.message); setSaving(null); },
  });

  const handleSave = (key: string) => {
    const value = editedValues[key];
    if (value === undefined) return;
    setSaving(key);
    updateSetting.mutate({ key, value });
  };

  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <div className="flex gap-4">
      {/* Category sidebar */}
      <div className="w-44 flex-shrink-0 space-y-1">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat] ?? Settings;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-muted/50 text-muted-foreground"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      {/* Settings list */}
      <div className="flex-1 space-y-3">
        {allSettings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No settings in this category</div>
        ) : (
          allSettings.map((setting) => {
            const currentValue = editedValues[setting.key] ?? setting.value ?? "";
            const isDirty = editedValues[setting.key] !== undefined;

            return (
              <Card key={setting.key} className={cn("border-border transition-all", isDirty && "border-primary/50")}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{setting.label ?? setting.key}</p>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">{setting.type}</Badge>
                        {isDirty && <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border-0 text-[10px] h-4 px-1.5">Unsaved</Badge>}
                      </div>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground mb-3">{setting.description}</p>
                      )}

                      {setting.type === "boolean" ? (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={currentValue === "true"}
                            onCheckedChange={(checked) => {
                              const val = checked ? "true" : "false";
                              setEditedValues((p) => ({ ...p, [setting.key]: val }));
                            }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {currentValue === "true" ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      ) : (
                        <Input
                          value={currentValue}
                          onChange={(e) => setEditedValues((p) => ({ ...p, [setting.key]: e.target.value }))}
                          className="h-8 text-sm max-w-sm"
                          type={setting.key.includes("password") || setting.key.includes("secret") ? "password" : "text"}
                        />
                      )}
                    </div>

                    {isDirty && (
                      <Button
                        size="sm"
                        className="brand-gradient text-white border-0 h-8 text-xs gap-1.5 flex-shrink-0"
                        onClick={() => handleSave(setting.key)}
                        disabled={saving === setting.key}
                      >
                        {saving === setting.key ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Save
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── AUDIT LOG TAB ────────────────────────────────────────────────────────────
function AuditLogTab() {
  const [search, setSearch] = useState("");
  const { data: logs = [] } = trpc.admin.listAuditLogs.useQuery({ search, limit: 100, page: 1 });

  const entityColors: Record<string, string> = {
    user: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    app_setting: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    contact: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    campaign: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    integration: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search audit logs..."
          className="pl-9 h-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Timestamp", "User", "Action", "Entity", "IP Address"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(logs as { id: number | bigint; createdAt: Date; userName?: string | null; userEmail?: string | null; action: string; entity?: string | null; ipAddress?: string | null }[]).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">No audit logs yet</td>
                </tr>
              ) : (
                (logs as { id: number | bigint; createdAt: Date; userName?: string | null; userEmail?: string | null; action: string; entity?: string | null; ipAddress?: string | null }[]).map((log) => (
                  <tr key={String(log.id)} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <p className="text-sm font-medium">{log.userName ?? "System"}</p>
                      {log.userEmail && <p className="text-xs text-muted-foreground">{log.userEmail}</p>}
                    </td>
                    <td className="py-2.5 px-4 text-sm max-w-xs truncate">{log.action}</td>
                    <td className="py-2.5 px-4">
                      {log.entity && (
                        <Badge className={cn("text-[10px] border-0", entityColors[log.entity] ?? "bg-muted text-muted-foreground")}>
                          {log.entity}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-muted-foreground font-mono">{log.ipAddress ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── SYSTEM HEALTH TAB ────────────────────────────────────────────────────────
function SystemHealthTab() {
  const { data: stats, refetch, isLoading } = trpc.admin.getSystemStats.useQuery();

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: "Total Users", value: stats ? String(stats.totalUsers) : "—", icon: Users, color: "text-blue-500 bg-blue-50 dark:bg-blue-950" },
          { label: "Admin Users", value: stats ? String(stats.adminUsers) : "—", icon: Crown, color: "text-orange-500 bg-orange-50 dark:bg-orange-950" },
          { label: "Total Contacts", value: stats ? String(stats.totalContacts) : "—", icon: Users, color: "text-green-500 bg-green-50 dark:bg-green-950" },
          { label: "Total Campaigns", value: stats ? String(stats.totalCampaigns) : "—", icon: Mail, color: "text-purple-500 bg-purple-50 dark:bg-purple-950" },
          { label: "Conversations", value: stats ? String(stats.totalConversations) : "—", icon: MessageSquare, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950" },
          { label: "Active Sessions", value: stats ? String(stats.activeSessions) : "—", icon: Activity, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "..." : value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Server Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              Server Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Node.js Version", value: stats?.nodeVersion ?? "—" },
              { label: "Server Uptime", value: stats ? formatUptime(stats.uptime) : "—" },
              { label: "Server Time (UTC)", value: stats ? new Date(stats.serverTime).toUTCString() : "—" },
              { label: "Environment", value: "Production" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-mono font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Connection", value: "Connected", status: "ok" },
              { label: "Type", value: "MySQL / TiDB" },
              { label: "ORM", value: "Drizzle ORM" },
              { label: "Schema Version", value: "0002" },
            ].map(({ label, value, status }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <div className="flex items-center gap-1.5">
                  {status === "ok" && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                  <span className="text-xs font-medium">{value}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Integration Health */}
      {stats?.integrationHealth && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Plug className="w-4 h-4 text-primary" />
              Integration Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {(stats.integrationHealth as { name: string; status: string }[]).map(({ name, status }) => (
                <div key={name} className={cn(
                  "flex items-center gap-2 p-2.5 rounded-lg border text-sm",
                  status === "connected" ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30" : "border-border bg-muted/20"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    status === "connected" ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"
                  )} />
                  <span className="font-medium text-xs truncate">{name}</span>
                  <Badge className={cn(
                    "ml-auto text-[10px] border-0 h-4 px-1.5 flex-shrink-0",
                    status === "connected" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted text-muted-foreground"
                  )}>
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Audit Events */}
      {stats?.recentLogs && stats.recentLogs.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Recent System Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentLogs.map((log) => (
                <div key={String(log.id)} className="flex items-center gap-3 text-xs py-1.5 border-b border-border/50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="flex-1 truncate">{log.action}</span>
                  <span className="text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/dashboard");
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage users, permissions, and global app settings
            </p>
          </div>
          <Badge className="ml-auto bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-0 gap-1.5">
            <Crown className="w-3.5 h-3.5" />
            Administrator
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-10">
            <TabsTrigger value="users" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-1.5 text-xs">
              <Lock className="w-3.5 h-3.5" /> Permissions
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5" /> App Settings
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" /> Audit Log
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-1.5 text-xs">
              <Activity className="w-3.5 h-3.5" /> System Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4"><UsersTab /></TabsContent>
          <TabsContent value="permissions" className="mt-4"><PermissionsTab /></TabsContent>
          <TabsContent value="settings" className="mt-4"><SettingsTab /></TabsContent>
          <TabsContent value="audit" className="mt-4"><AuditLogTab /></TabsContent>
          <TabsContent value="health" className="mt-4"><SystemHealthTab /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
