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
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Import creator routes
import CreatorCampaignsPage from "@/pages/creator/campaigns";
import CreatorAnalyticsPage from "@/pages/creator/analytics";
import CreatorPaymentsPage from "@/pages/creator/payments";
import CreatorAIGeneratorPage from "@/pages/creator/ai-generator";
import CreatorNewCampaignPage from "@/pages/creator/new-campaign";

// Import influencer routes
import InfluencerCampaignsPage from "@/pages/influencer/campaigns";
import InfluencerAnalyticsPage from "@/pages/influencer/analytics";
import InfluencerPaymentsPage from "@/pages/influencer/payments";
import InfluencerMarketplacePage from "@/pages/influencer/marketplace";
import InfluencerAccountsPage from "@/pages/influencer/accounts";
import CampaignDetailsPage from "@/pages/influencer/campaign-details";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/whitepaper" component={WhitepaperPage} />
      
      {/* Creator routes */}
      <ProtectedRoute path="/creator" component={CreatorDashboard} />
      <ProtectedRoute path="/creator/campaigns" component={CreatorCampaignsPage} />
      <ProtectedRoute path="/creator/analytics" component={CreatorAnalyticsPage} />
      <ProtectedRoute path="/creator/payments" component={CreatorPaymentsPage} />
      <ProtectedRoute path="/creator/ai-generator" component={CreatorAIGeneratorPage} />
      <ProtectedRoute path="/creator/new-campaign" component={CreatorNewCampaignPage} />
      
      {/* Influencer routes */}
      <ProtectedRoute path="/influencer" component={InfluencerDashboard} />
      <ProtectedRoute path="/influencer/campaigns" component={InfluencerCampaignsPage} />
      <ProtectedRoute path="/influencer/marketplace/:id" component={CampaignDetailsPage} />
      <ProtectedRoute path="/influencer/marketplace" component={InfluencerMarketplacePage} />
      <ProtectedRoute path="/influencer/analytics" component={InfluencerAnalyticsPage} />
      <ProtectedRoute path="/influencer/payments" component={InfluencerPaymentsPage} />
      <ProtectedRoute path="/influencer/accounts" component={InfluencerAccountsPage} />
      
      {/* 404 page */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" attribute="class">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
