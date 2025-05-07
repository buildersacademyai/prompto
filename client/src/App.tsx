import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AboutPage from "@/pages/about-page";
import WhitepaperPage from "@/pages/whitepaper-page";
import CreatorDashboard from "@/pages/creator-dashboard";
import InfluencerDashboard from "@/pages/influencer-dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/whitepaper" component={WhitepaperPage} />
      <ProtectedRoute path="/creator" component={CreatorDashboard} />
      <ProtectedRoute path="/influencer" component={InfluencerDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
