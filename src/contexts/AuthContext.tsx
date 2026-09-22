import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const googleProvider = new GoogleAuthProvider();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  /** true si le compte courant possède un mot de passe (et pas seulement Google) */
  hasPasswordProvider: boolean;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<void>;
  resendVerification: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  verifyResetCode: (code: string) => Promise<string>;
  confirmReset: (code: string, newPassword: string) => Promise<void>;
  applyEmailVerification: (code: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

/** Erreur locale — l'email n'a pas encore été vérifié. */
class EmailNotVerifiedError extends Error {
  code = "auth/email-not-verified";
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;
  const hasPasswordProvider = !!user?.providerData.some((p) => p.providerId === "password");

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!cred.user.emailVerified && cred.user.email !== ADMIN_EMAIL) {
      await sendEmailVerification(cred.user);
      await signOut(auth);
      throw new EmailNotVerifiedError();
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
    await sendEmailVerification(cred.user);
    // L'utilisateur doit confirmer son email avant d'accéder au site.
    await signOut(auth);
  };

  /** Renvoie le mail de vérification — nécessite les identifiants, le user étant déconnecté. */
  const resendVerification = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    await signOut(auth);
  };

  const signInAdmin = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/connexion`,
    });
  };

  const verifyResetCode = async (code: string) => verifyPasswordResetCode(auth, code);

  const confirmReset = async (code: string, newPassword: string) => {
    await confirmPasswordReset(auth, code, newPassword);
  };

  /** Valide le lien de vérification d'email reçu par mail. */
  const applyEmailVerification = async (code: string) => {
    await applyActionCode(auth, code);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const current = auth.currentUser;
    if (!current?.email) throw new Error("Aucun utilisateur connecté.");
    const credential = EmailAuthProvider.credential(current.email, currentPassword);
    await reauthenticateWithCredential(current, credential);
    await updatePassword(current, newPassword);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        hasPasswordProvider,
        signInWithGoogle,
        signIn,
        signUp,
        signInAdmin,
        resendVerification,
        sendPasswordReset,
        verifyResetCode,
        confirmReset,
        applyEmailVerification,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
