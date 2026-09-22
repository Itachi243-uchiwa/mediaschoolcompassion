import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";
import { authErrorMessage } from "@/lib/authErrors";
import { ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";

const MIN_PASSWORD_LENGTH = 8;

const ChangePasswordPage = () => {
  const { changePassword, hasPasswordProvider, user } = useAuth();
  const navigate = useNavigate();

  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (password === current) {
      setError("Le nouveau mot de passe doit être différent de l'actuel.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(current, password);
      setDone(true);
      setCurrent("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-nav sm:pb-10">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mot de passe</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {!hasPasswordProvider ? (
        <div className="p-6 rounded-xl border border-border bg-card space-y-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <KeyRound className="h-4 w-4" />Connexion via Google
          </h2>
          <p className="text-sm text-muted-foreground">
            Ton compte utilise la connexion Google — il n'a pas de mot de passe à modifier ici.
            Gère-le directement depuis ton compte Google.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-border bg-card space-y-5">
          <div className="space-y-2">
            <Label htmlFor="current">Mot de passe actuel</Label>
            <PasswordInput id="current" value={current} onChange={setCurrent} autoComplete="current-password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" />
            <p className="text-xs text-muted-foreground">{MIN_PASSWORD_LENGTH} caractères minimum.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmer le nouveau mot de passe</Label>
            <PasswordInput id="confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
          {done && (
            <p className="text-sm text-primary flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />Mot de passe mis à jour.
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || !current || !password || !confirm}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {loading ? "Enregistrement..." : "Changer le mot de passe"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Mot de passe oublié ?{" "}
            <Link to="/mot-de-passe-oublie" className="text-primary hover:underline">Reçois un lien par email</Link>
          </p>
        </form>
      )}
    </div>
  );
};

export default ChangePasswordPage;
