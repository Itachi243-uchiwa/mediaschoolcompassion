import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPanel from "./pages/AdminPanel";
import Dashboard from "./pages/Dashboard";
import CoursePage from "./pages/CoursePage";
import ModuleDetail from "./pages/ModuleDetail";
import VideoPlayer from "./pages/VideoPlayer";
import DonationSuccess from "./pages/DonationSuccess";
import DonationCancel from "./pages/DonationCancel";
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
      {/* Admin — pas de AppShell */}
      <Route path="/admin/login" element={user && isAdmin ? <Navigate to="/admin" replace /> : <AdminLoginPage />} />
      <Route path="/admin/*" element={!user ? <Navigate to="/admin/login" replace /> : !isAdmin ? <Navigate to="/dashboard" replace /> : <AdminPanel />} />

      {/* Authentification — public */}
      <Route path="/connexion" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/inscription" element={user ? <Navigate to="/dashboard" replace /> : <SignUpPage />} />
      <Route path="/mot-de-passe-oublie" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
      {/* Lien reçu par email — accessible même connecté */}
      <Route path="/nouveau-mot-de-passe" element={<ResetPasswordPage />} />
      {/* Ancienne URL conservée pour les liens et PWA en cache */}
      <Route path="/login" element={<Navigate to="/connexion" replace />} />

      {/* Pages protégées — enveloppées dans AppShell */}
      <Route path="/dashboard" element={
        !user ? <Navigate to="/connexion" replace /> :
        <AppShell><Dashboard /></AppShell>
      } />
      <Route path="/compte/mot-de-passe" element={
        !user ? <Navigate to="/connexion" replace /> :
        <AppShell><ChangePasswordPage /></AppShell>
      } />
      <Route path="/formation/:courseId" element={
        !user ? <Navigate to="/connexion" replace /> :
        <AppShell><CoursePage /></AppShell>
      } />
      <Route path="/formation/:courseId/module/:moduleId" element={
        !user ? <Navigate to="/connexion" replace /> :
        <AppShell><ModuleDetail /></AppShell>
      } />
      <Route path="/formation/:courseId/module/:moduleId/video/:videoId" element={
        !user ? <Navigate to="/connexion" replace /> :
        <AppShell><VideoPlayer /></AppShell>
      } />

      {/* Donation return — public */}
      <Route path="/don/merci" element={<DonationSuccess />} />
      <Route path="/don/annule" element={<DonationCancel />} />

      {/* Root */}
      <Route path="/" element={!user ? <Navigate to="/connexion" replace /> : isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />} />
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
