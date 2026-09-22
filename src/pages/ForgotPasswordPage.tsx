import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/AuthLayout";
import { authErrorMessage } from "@/lib/authErrors";
import { KeyRound, MailCheck } from "lucide-react";

const ForgotPasswordPage = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        title="Email envoyé"
        subtitle={`Si un compte existe pour ${email.trim()}, un lien de réinitialisation vient d'être envoyé.`}
        icon={<MailCheck className="h-8 w-8 text-primary" />}
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Ouvre le lien reçu pour choisir un nouveau mot de passe. Pense à vérifier tes spams.
          </p>
          <Button asChild className="w-full h-12 text-base font-semibold" size="lg">
            <Link to="/connexion">Retour à la connexion</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="On t'envoie un lien pour en créer un nouveau"
      icon={<KeyRound className="h-8 w-8 text-primary" />}
      footer={<Link to="/connexion" className="font-semibold text-primary hover:underline">Retour à la connexion</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
            autoFocus
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" disabled={loading || !email.trim()} className="w-full h-12 text-base font-semibold" size="lg">
          {loading ? "Envoi..." : "Envoyer le lien"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
