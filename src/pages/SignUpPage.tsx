import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";
import { authErrorMessage } from "@/lib/authErrors";
import { MailCheck, UserPlus } from "lucide-react";

const MIN_PASSWORD_LENGTH = 8;

const SignUpPage = () => {
  const { signUp, resendVerification } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resent, setResent] = useState(false);

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
      await signUp(name, email.trim(), password);
      setDone(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    try {
      await resendVerification(email.trim(), password);
      setResent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };

  if (done) {
    return (
      <AuthLayout
        title="Vérifie tes emails"
        subtitle={`Un lien de confirmation a été envoyé à ${email.trim()}.`}
        icon={<MailCheck className="h-8 w-8 text-primary" />}
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Clique sur le lien reçu pour activer ton compte, puis connecte-toi.
            Pense à vérifier tes spams.
          </p>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button asChild className="w-full h-12 text-base font-semibold" size="lg">
            <Link to="/connexion">Aller à la connexion</Link>
          </Button>
          <Button variant="ghost" onClick={handleResend} disabled={resent} className="w-full">
            {resent ? "Email renvoyé !" : "Renvoyer l'email de confirmation"}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoins Media School en quelques secondes"
      icon={<UserPlus className="h-8 w-8 text-primary" />}
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link to="/connexion" className="font-semibold text-primary hover:underline">Se connecter</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton nom"
            autoComplete="name"
            className="h-12 text-base"
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@email.com"
            autoComplete="email"
            className="h-12 text-base"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" />
          <p className="text-xs text-muted-foreground">{MIN_PASSWORD_LENGTH} caractères minimum.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmer le mot de passe</Label>
          <PasswordInput id="confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          type="submit"
          disabled={loading || !name.trim() || !email.trim() || !password || !confirm}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default SignUpPage;
