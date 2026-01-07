import { app } from "@/lib/firebase";
import { Button } from "../ui/button";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Chrome } from "lucide-react";

interface OauthProps {
  message: string;
}

export function OAuth({ message }: OauthProps) {
  const { t } = useTranslation();
  const auth = getAuth(app);

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error(t("server.auth.errors.invalid_credentials"));
      }
    }
  };

  return (
      <Button
          type="button"
          onClick={handleGoogleAuth}
          className="flex items-center justify-center w-full gap-3 py-6 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition-colors"
      >
        <Chrome className="w-5 h-5 text-blue-500" />
        <span className="font-semibold">{t(message)}</span>
      </Button>
  );
}