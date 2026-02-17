import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProBackground from "@/components/ProBackground";
import GlobalThemeWrapper from "@/components/GlobalThemeWrapper";
import Landing from "./pages/Landing";
import CreatePortfolio from "./pages/CreatePortfolio";
import PortfolioView from "./pages/PortfolioView";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <GlobalThemeWrapper>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ProBackground />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/create" element={<CreatePortfolio />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/:username" element={<PortfolioView />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GlobalThemeWrapper>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
