import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPWA } from "@/hooks/useInstallPWA";

const InstallPWAButton = () => {
  const { canInstall, install } = useInstallPWA();

  if (!canInstall) return null;

  return (
    <Button
      onClick={install}
      variant="outline"
      size="sm"
      className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all"
    >
      <Download className="h-4 w-4" />
      Installer l'app
    </Button>
  );
};

export default InstallPWAButton;
