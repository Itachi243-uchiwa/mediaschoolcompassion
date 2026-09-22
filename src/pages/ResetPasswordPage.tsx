import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";
import { authErrorMessage } from "@/lib/authErrors";
import { KeyRound, CheckCircle2 } from "lucide-react";

const MIN_PASSWORD_LENGTH = 8;

const ResetPasswordPage = () => {
  const { verifyResetCode, confirmReset, applyEmailVerification } = useAuth();
  const [params] = useSearchParams();
  const oobCode = params.get("oobCode");
  // Firebase réutilise la même URL d'action pour la vérification d'email.
  const mode = params.get("mode") ?? "resetPassword";

  const [checking, setChecking] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Le code n'est vérifié qu'une fois : le consommer deux fois l'invaliderait.
  const handledCode = useRef<string | null>(null);

  useEffect(() => {
    if (handledCode.current === oobCode) return;
    handledCode.current = oobCode;

    if (!oobCode) {
      setCodeError("Lien invalide — le code de réinitialisation est manquant.");
      setChecking(false);
      return;
    }
    if (mode === "verifyEmail") {
      applyEmailVerification(oobCode)
        .then(() => setEmailVerified(true))
        .catch((err) => setCodeError(authErrorMessage(err)))
        .finally(() => setChecking(false));
      return;
    }
    verifyResetCode(oobCode)
      .then((mail) => setAccountEmail(mail))
      .catch((err) => setCodeError(authErrorMessage(err)))
      .finally(() => setChecking(false));
  }, [oobCode, mode, verifyResetCode, applyEmailVerification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await confirmReset(oobCode!, password);
      setDone(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (codeError) {
    return (
      <AuthLayout title="Lien expiré" subtitle={codeError} icon={<KeyRound className="h-8 w-8 text-primary" />}>
        <Button asChild className="w-full h-12 text-base font-semibold" size="lg">
          <Link to="/mot-de-passe-oublie">Demander un nouveau lien</Link>
        </Button>
      </AuthLayout>
    );
  }

  if (emailVerified) {
    return (
      <AuthLayout
        title="Email vérifié"
        subtitle="Ton compte est activé — tu peux te connecter."
        icon={<CheckCircle2 className="h-8 w-8 text-primary" />}
      >
        <Button asChild className="w-full h-12 text-base font-semibold" size="lg">
          <Link to="/connexion">Se connecter</Link>
        </Button>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout
        title="Mot de passe modifié"
        subtitle="Tu peux maintenant te connecter avec ton nouveau mot de passe."
        icon={<CheckCircle2 className="h-8 w-8 text-primary" />}
      >
        <Button asChild className="w-full h-12 text-base font-semibold" size="lg">
          <Link to="/connexion">Se connecter</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nouveau mot de passe"
      subtitle={accountEmail ? `Pour le compte ${accountEmail}` : undefined}
      icon={<KeyRound className="h-8 w-8 text-primary" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" autoFocus />
          <p className="text-xs text-muted-foreground">{MIN_PASSWORD_LENGTH} caractères minimum.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmer le mot de passe</Label>
          <PasswordInput id="confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" disabled={loading || !password || !confirm} className="w-full h-12 text-base font-semibold" size="lg">
          {loading ? "Enregistrement..." : "Enregistrer le mot de passe"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
