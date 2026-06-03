import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import InstallPWAButton from "@/components/InstallPWAButton";
import { Button } from "@/components/ui/button";
import DonationButton from "@/components/DonationButton";
import { LogOut, ArrowLeft } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onDashboard = location.pathname === "/dashboard";
  const userName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "";
  const userPhoto = user?.photoURL;

  // Detect parent route for back navigation
  const getBackPath = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return null;
    if (location.pathname.includes("/video/")) {
      // video → module
      const idx = parts.indexOf("video");
      return "/" + parts.slice(0, idx).join("/");
    }
    if (location.pathname.includes("/module/")) {
      // module → course
      const idx = parts.indexOf("module");
      return "/" + parts.slice(0, idx).join("/");
    }
    if (parts[0] === "formation") return "/dashboard";
    return "/dashboard";
  };

  const backPath = !onDashboard ? getBackPath() : null;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Desktop top nav ── */}
      <nav className="hidden sm:block sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {backPath && (
              <button
                onClick={() => navigate(backPath)}
                className="mr-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <img
              src="/Digital School Logo.png"
              alt=""
              className="h-9 w-9 rounded-lg object-cover cursor-pointer"
              onClick={() => navigate("/dashboard")}
            />
            <span className="font-bold text-foreground tracking-tight">Media School</span>
          </div>
          <div className="flex items-center gap-3">
            <InstallPWAButton />
            <DonationButton
              size="sm"
              variant="outline"
              label="Soutenir"
              className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
              context="Votre don aide à maintenir les formations de Media School Compassion accessibles gratuitement."
            />
            {userPhoto && <img src={userPhoto} alt={userName} className="w-8 h-8 rounded-full ring-2 ring-border" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => { await logout(); navigate("/login"); }}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Mobile top bar — dashboard only ── */}
      {onDashboard && (
        <header className="sticky top-0 z-50 sm:hidden bg-background/90 backdrop-blur-2xl border-b border-border/40">
          <div className="flex items-center gap-3 px-4 h-14">
            <img src="/Digital School Logo.png" alt="" className="h-8 w-8 rounded-xl object-cover flex-shrink-0" />
            <span className="font-bold text-sm text-foreground flex-1">Media School</span>
            {userPhoto && (
              <img src={userPhoto} alt={userName} className="w-8 h-8 rounded-full ring-2 ring-border flex-shrink-0" />
            )}
          </div>
        </header>
      )}

      {/* ── Page content ── */}
      {children}

      {/* ── Mobile bottom nav (all pages) ── */}
      <MobileBottomNav />
    </div>
  );
};

export default AppShell;
