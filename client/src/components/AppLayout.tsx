import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Share2,
  GitBranch,
  MessageSquare,
  Bot,
  BarChart3,
  Plug,
  Settings,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  Globe,
  Zap,
  Shield,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030051896/YU6nqmaEyUsACHGWVz8xRF/GetSales4Now_logo_transparent_a2f08e10.jpg";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  path: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, labelKey: "nav.dashboard", path: "/dashboard" },
  { icon: Users, labelKey: "nav.crm", path: "/crm" },
  { icon: Megaphone, labelKey: "nav.campaigns", path: "/campaigns" },
  { icon: Share2, labelKey: "nav.social", path: "/social" },
  { icon: GitBranch, labelKey: "nav.funnels", path: "/funnels" },
  { icon: MessageSquare, labelKey: "nav.inbox", path: "/inbox", badge: "3" },
  { icon: Bot, labelKey: "nav.ai", path: "/ai" },
  { icon: BarChart3, labelKey: "nav.reports", path: "/reports" },
  { icon: Plug, labelKey: "nav.integrations", path: "/integrations" },
  { icon: CreditCard, labelKey: "nav.billing", path: "/billing" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { logout(); },
    onError: () => { toast.error("Logout failed"); },
  });

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-sidebar-border", collapsed && "justify-center px-2")}>
        <img src={LOGO_URL} alt="GetSales4Now" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">GetSales4Now</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">Digital Marketing & Sales</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path || location.startsWith(item.path + "/");
          const Icon = item.icon;
          const label = t(item.labelKey);

          return collapsed ? (
            <Tooltip key={item.path} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href={item.path}>
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg mx-auto cursor-pointer transition-all duration-150",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
            </Tooltip>
          ) : (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium flex-1 truncate">{label}</span>
                {item.badge && (
                  <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn("border-t border-sidebar-border p-3 space-y-1", collapsed && "px-2")}>
        {/* Admin Panel — only visible to admin users */}
        {user?.role === "admin" && (
          collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href="/admin">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg mx-auto cursor-pointer transition-all",
                    location === "/admin"
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
                  )}>
                    <Shield className="w-5 h-5" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Admin Panel</TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/admin">
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                location === "/admin"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
              )}>
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Admin Panel</span>
              </div>
            </Link>
          )
        )}
        {/* Settings */}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link href="/settings">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg mx-auto cursor-pointer text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all">
                  <Settings className="w-5 h-5" />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{t("nav.settings")}</TooltipContent>
          </Tooltip>
        ) : (
          <Link href="/settings">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all">
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{t("nav.settings")}</span>
            </div>
          </Link>
        )}

        {/* User profile */}
        {!collapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-all">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name ?? "User"}</p>
                  <p className="text-[11px] text-sidebar-foreground/50 truncate">{user?.email ?? ""}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-sidebar-foreground/50 flex-shrink-0" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-52">
              <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col flex-shrink-0 sidebar-gradient transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-60" : "w-16"
        )}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 sidebar-gradient flex flex-col">
            <SidebarContent collapsed={false} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border flex-shrink-0">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Logo on mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <img src={LOGO_URL} alt="GetSales4Now" className="w-7 h-7 rounded object-cover" />
            <span className="font-bold text-sm brand-gradient-text">GetSales4Now</span>
          </div>

          <div className="flex-1" />

          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(language === lang.code && "font-semibold text-primary")}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.nativeName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* AI Quick Access */}
          <Link href="/ai">
            <Button size="sm" className="gap-1.5 brand-gradient text-white border-0 shadow-sm hidden sm:flex">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold">AI Copilot</span>
            </Button>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
