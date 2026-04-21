import { useNavigate } from "react-router-dom";
import { CheckCircle2, Heart, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DonationSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">

      {/* Animated glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md text-center space-y-6">

        {/* Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
            <Heart className="h-4 w-4 text-rose-500" fill="currentColor" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Merci pour votre don ! 🙏
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Votre soutien contribue directement à maintenir les formations de Media School Compassion accessibles à tous, gratuitement.
          </p>
        </div>

        {/* Impact card */}
        <div className="rounded-2xl bg-card border border-border/60 p-6 space-y-4 text-left">
          <p className="text-sm font-semibold text-foreground mb-3">Grâce à votre soutien :</p>
          <div className="space-y-3">
            {[
              { icon: Globe, text: "Les formations restent gratuites et accessibles à tous" },
              { icon: Heart, text: "De nouveaux contenus peuvent être produits et publiés" },
              { icon: CheckCircle2, text: "La plateforme continue à évoluer pour les apprenants" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 gap-2 h-11"
            onClick={() => navigate("/dashboard")}
          >
            Continuer à apprendre
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground/60">
          Un reçu de paiement vous a été envoyé par email via Mollie.
        </p>
      </div>
    </div>
  );
};

export default DonationSuccess;
