import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Campaigns from "./pages/Campaigns";
import SocialMedia from "./pages/SocialMedia";
import Funnels from "./pages/Funnels";
import InboxPage from "./pages/Inbox";
import AIAgents from "./pages/AIAgents";
import Reports from "./pages/Reports";
import Integrations from "./pages/Integrations";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/crm" component={CRM} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/social" component={SocialMedia} />
      <Route path="/funnels" component={Funnels} />
      <Route path="/inbox" component={InboxPage} />
      <Route path="/ai" component={AIAgents} />
      <Route path="/reports" component={Reports} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
