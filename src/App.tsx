import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPanel from "./pages/AdminPanel";
import Dashboard from "./pages/Dashboard";
import CoursePage from "./pages/CoursePage";
import ModuleDetail from "./pages/ModuleDetail";
import VideoPlayer from "./pages/VideoPlayer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Admin */}
      <Route path="/admin/login" element={user && isAdmin ? <Navigate to="/admin" replace /> : <AdminLoginPage />} />
      <Route path="/admin/*" element={!user ? <Navigate to="/admin/login" replace /> : !isAdmin ? <Navigate to="/dashboard" replace /> : <AdminPanel />} />

      {/* Public login */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Public pages */}
      <Route path="/dashboard" element={!user ? <Navigate to="/login" replace /> : <Dashboard />} />
      <Route path="/formation/:courseId" element={!user ? <Navigate to="/login" replace /> : <CoursePage />} />
      <Route path="/formation/:courseId/module/:moduleId" element={!user ? <Navigate to="/login" replace /> : <ModuleDetail />} />
      <Route path="/formation/:courseId/module/:moduleId/video/:videoId" element={!user ? <Navigate to="/login" replace /> : <VideoPlayer />} />

      {/* Root */}
      <Route path="/" element={!user ? <Navigate to="/login" replace /> : isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

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
