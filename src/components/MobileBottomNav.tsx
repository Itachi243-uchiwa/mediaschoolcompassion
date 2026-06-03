import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Heart, User, LogOut, Download, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInstallPWA } from "@/hooks/useInstallPWA";
import DonationModal from "@/components/DonationModal";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { canInstall, install } = useInstallPWA();
  const [donateOpen, setDonateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const onDashboard = location.pathname === "/dashboard";
  const userName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "";

  return (
    <>
      {/* ── Tab bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/92 backdrop-blur-2xl border-t border-border/50">
        <div className="flex items-center h-nav">
          {/* Accueil */}
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all active:scale-90 active:opacity-60 ${onDashboard ? "text-primary" : "text-muted-foreground"}`}
          >
            <Home className="h-5 w-5" strokeWidth={onDashboard ? 2.5 : 1.75} />
            <span className={`text-[10px] font-semibold ${onDashboard ? "text-primary" : "text-muted-foreground/70"}`}>Accueil</span>
          </button>

          {/* Soutenir */}
          <button
            onClick={() => setDonateOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-muted-foreground transition-all active:scale-90 active:opacity-60"
          >
            <Heart className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold text-muted-foreground/70">Soutenir</span>
          </button>

          {/* Profil */}
          <button
            onClick={() => setProfileOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all active:scale-90 active:opacity-60 ${profileOpen ? "text-primary" : "text-muted-foreground"}`}
          >
            {user?.photoURL
              ? <img src={user.photoURL} alt="" className="h-6 w-6 rounded-full ring-1 ring-border" />
              : <User className="h-5 w-5" strokeWidth={1.75} />}
            <span className={`text-[10px] font-semibold ${profileOpen ? "text-primary" : "text-muted-foreground/70"}`}>Profil</span>
          </button>
        </div>
      </nav>

      {/* ── Donation modal ── */}
      <DonationModal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        context="Votre soutien aide à maintenir les formations de Media School Compassion accessibles gratuitement."
      />

      {/* ── Profile bottom sheet ── */}
      {profileOpen && (
        <div className="fixed inset-0 z-[60] sm:hidden" onClick={() => setProfileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t border-border/60 shadow-2xl"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-border/60" />
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
              {user?.photoURL
                ? <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full ring-2 ring-border" />
                : <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button onClick={() => setProfileOpen(false)} className="text-muted-foreground p-1 active:opacity-60">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="px-4 py-2">
              {canInstall && (
                <button
                  onClick={() => { install(); setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl text-left active:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Installer l'app</p>
                    <p className="text-xs text-muted-foreground">Ajouter à l'écran d'accueil</p>
                  </div>
                </button>
              )}

              <button
                onClick={async () => { setProfileOpen(false); await logout(); navigate("/login"); }}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl text-left active:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <LogOut className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-destructive">Se déconnecter</p>
                  <p className="text-xs text-muted-foreground">Fermer la session</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
