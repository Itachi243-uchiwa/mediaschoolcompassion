import { useState } from "react";
import { Heart, Loader2, X, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  /** Contexte affiché dans le modal (ex. "après avoir regardé une vidéo") */
  context?: string;
}

const PRESET_AMOUNTS = [5, 10, 20, 50];

const IMPACT_MESSAGES: Record<number, string> = {
  5: "contribue à couvrir les frais d'hébergement de la plateforme",
  10: "aide à maintenir l'accès gratuit aux formations pour tous",
  20: "permet de produire et publier de nouvelles vidéos de formation",
  50: "finance le développement de nouvelles fonctionnalités pour les apprenants",
};

function getImpactMessage(amount: number): string {
  if (amount >= 50) return IMPACT_MESSAGES[50];
  if (amount >= 20) return IMPACT_MESSAGES[20];
  if (amount >= 10) return IMPACT_MESSAGES[10];
  if (amount >= 5) return IMPACT_MESSAGES[5];
  return "contribue à la mission de Media School Compassion";
}

export default function DonationModal({ open, onClose, context }: DonationModalProps) {
  const [selected, setSelected] = useState<number | null>(10);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const effectiveAmount = custom ? parseFloat(custom) : selected;
  const isValid = effectiveAmount !== null && !isNaN(effectiveAmount) && effectiveAmount >= 1;
  const impactMsg = isValid && effectiveAmount ? getImpactMessage(effectiveAmount) : null;

  const handleCustomChange = (v: string) => {
    // Only allow positive numbers
    if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) {
      setCustom(v);
      setSelected(null);
      setError("");
    }
  };

  const handlePreset = (amount: number) => {
    setSelected(amount);
    setCustom("");
    setError("");
  };

  const handleDonate = async () => {
    if (!isValid || !effectiveAmount) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: effectiveAmount.toFixed(2),
          description: "Don volontaire — Media School Compassion",
        }),
      });

      const data = await res.json() as { checkoutUrl?: string; error?: string };

      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || "Une erreur est survenue. Merci de réessayer.");
        setLoading(false);
        return;
      }

      // Redirect to Mollie hosted checkout
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Impossible de se connecter au service de paiement.");
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-card px-6 pt-8 pb-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-7 w-7 text-primary" fill="currentColor" />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1">Soutenir Media School Compassion</h2>
          {context ? (
            <p className="text-sm text-muted-foreground">{context}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Votre don aide à maintenir l'accès gratuit aux formations pour tous
            </p>
          )}
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-5">

          {/* Amount presets */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Choisir un montant
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handlePreset(amt)}
                  className={`rounded-xl py-3 text-sm font-semibold transition-all border ${
                    selected === amt && !custom
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.03]"
                      : "bg-secondary/60 text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  {amt}€
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Ou un montant libre
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="Autre montant..."
                value={custom}
                onChange={(e) => handleCustomChange(e.target.value)}
                className="pl-8 bg-secondary/40 border-border focus:border-primary/60 rounded-xl h-11"
              />
            </div>
          </div>

          {/* Impact message */}
          {impactMsg && (
            <div className="flex items-start gap-2.5 rounded-xl bg-primary/8 border border-primary/20 px-4 py-3">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 leading-relaxed">
                <span className="font-semibold text-primary">{effectiveAmount?.toFixed(0)}€</span>{" "}
                {impactMsg}.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">{error}</p>
          )}

          {/* CTA */}
          <Button
            className="w-full h-12 text-base font-semibold rounded-xl gap-2 shadow-lg shadow-primary/20"
            disabled={!isValid || loading}
            onClick={handleDonate}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirection...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4" fill="currentColor" />
                Faire un don {isValid && effectiveAmount ? `de ${effectiveAmount.toFixed(0)}€` : ""}
              </>
            )}
          </Button>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70">
            <Globe className="h-3 w-3" />
            <span>Paiement sécurisé via Mollie · CB, Virement, iDEAL…</span>
          </div>
        </div>
      </div>
    </div>
  );
}
