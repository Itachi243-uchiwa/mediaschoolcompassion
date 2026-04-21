import { useNavigate } from "react-router-dom";
import { XCircle, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import DonationModal from "@/components/DonationModal";

const DonationCancel = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">

      <div className="relative w-full max-w-sm text-center space-y-6">

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto">
          <XCircle className="h-10 w-10 text-muted-foreground" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Don annulé</h1>
          <p className="text-muted-foreground leading-relaxed">
            Pas de souci — votre paiement n'a pas été traité. Vous pouvez réessayer quand vous voulez. 😊
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Button
            className="gap-2 h-11"
            onClick={() => setShowModal(true)}
          >
            <Heart className="h-4 w-4" fill="currentColor" />
            Réessayer
          </Button>
          <Button
            variant="ghost"
            className="gap-2 text-muted-foreground"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </div>
      </div>

      <DonationModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default DonationCancel;
