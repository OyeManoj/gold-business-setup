import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TransactionFlow from "./pages/TransactionFlow";
import BusinessProfile from "./pages/BusinessProfile";

import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/transaction/:type" element={<ProtectedRoute><TransactionFlow /></ProtectedRoute>} />
            <Route path="/transaction/:type/edit/:transactionId" element={<ProtectedRoute><TransactionFlow /></ProtectedRoute>} />
            <Route path="/business-profile" element={<ProtectedRoute><BusinessProfile /></ProtectedRoute>} />
            
            <Route path="/history" element={<ProtectedRoute><RoleProtectedRoute requiredPermission="history"><History /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
