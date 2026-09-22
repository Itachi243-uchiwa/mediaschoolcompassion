// ─── Messages d'erreur Firebase Auth en français ──────────────────────────────

const MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Adresse email invalide.",
  "auth/user-disabled": "Ce compte a été désactivé.",
  "auth/user-not-found": "Aucun compte ne correspond à cet email.",
  "auth/wrong-password": "Email ou mot de passe incorrect.",
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
  "auth/email-already-in-use": "Un compte existe déjà avec cet email.",
  "auth/weak-password": "Mot de passe trop faible (6 caractères minimum).",
  "auth/too-many-requests": "Trop de tentatives. Réessaie dans quelques minutes.",
  "auth/network-request-failed": "Connexion impossible. Vérifie ta connexion internet.",
  "auth/requires-recent-login": "Reconnecte-toi avant de modifier ton mot de passe.",
  "auth/popup-closed-by-user": "Fenêtre de connexion fermée.",
  "auth/popup-blocked": "La fenêtre de connexion a été bloquée par le navigateur.",
  "auth/expired-action-code": "Ce lien a expiré. Demande-en un nouveau.",
  "auth/invalid-action-code": "Ce lien est invalide ou a déjà été utilisé.",
  "auth/email-not-verified": "Vérifie ton adresse email avant de te connecter. Un nouveau lien vient de t'être envoyé.",
};

export const authErrorMessage = (err: unknown): string => {
  const code = (err as { code?: string })?.code;
  if (code && MESSAGES[code]) return MESSAGES[code];
  return "Une erreur est survenue. Réessaie.";
};
