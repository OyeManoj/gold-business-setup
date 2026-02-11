import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TransactionFlow from "./pages/TransactionFlow";
import BusinessProfile from "./pages/BusinessProfile";
import History from "./pages/History";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isLoading, autoLoginFailed, retryAutoLogin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && autoLoginFailed) {
    return (
      <Routes>
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Failed to connect</p>
          <Button onClick={retryAutoLogin} variant="outline" className="gap-2">
            <RefreshCw size={16} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/transaction/:type" element={<TransactionFlow />} />
      <Route path="/transaction/:type/edit/:transactionId" element={<TransactionFlow />} />
      <Route path="/business-profile" element={<BusinessProfile />} />
      <Route path="/history" element={<History />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
