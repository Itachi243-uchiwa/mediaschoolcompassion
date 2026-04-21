import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import DonationModal from "./DonationModal";

interface DonationButtonProps {
  /** Variante visuelle du bouton */
  variant?: "default" | "outline" | "ghost" | "secondary";
  /** Taille du bouton */
  size?: "default" | "sm" | "lg" | "icon";
  /** Classe CSS additionnelle */
  className?: string;
  /** Texte affiché sur le bouton (défaut : "Faire un don") */
  label?: string;
  /** Contexte affiché dans la modal */
  context?: string;
  /** Afficher l'icône cœur */
  showIcon?: boolean;
}

/**
 * Bouton de don réutilisable — ouvre la DonationModal au clic.
 * Peut être placé n'importe où dans l'app.
 */
export default function DonationButton({
  variant = "default",
  size = "default",
  className = "",
  label = "Faire un don",
  context,
  showIcon = true,
}: DonationButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`gap-2 ${className}`}
        onClick={() => setOpen(true)}
      >
        {showIcon && <Heart className="h-4 w-4" fill={variant === "default" ? "currentColor" : "none"} />}
        {label}
      </Button>

      <DonationModal
        open={open}
        onClose={() => setOpen(false)}
        context={context}
      />
    </>
  );
}
