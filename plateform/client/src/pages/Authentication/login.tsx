import { useAuthContext } from "@/contexts/authContext";
import { useConfigContext } from "@/contexts/configContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { OAuth } from "@/components/customs/oauth";
import { Loader2, Box } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { authUser, loading: authLoading } = useAuthContext();
  const { getConfigValue } = useConfigContext();
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchConfig = async () => {
      const values = await getConfigValue(["APP_NAME"]);
      setConfigValues(values);
    };
    fetchConfig();
  }, [getConfigValue]);

  useEffect(() => {
    if (authUser && !authLoading) {
      navigate("/");
    }
  }, [authUser, authLoading, navigate]);

  if (authLoading) {
    return (
        <div className="flex h-svh items-center justify-center bg-background">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-8 bg-background px-4">

        <div className="flex flex-col items-center gap-4">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl border-2 border-primary shadow-[0_20px_50px_rgba(var(--primary),0.2)] animate-in fade-in zoom-in duration-700">
            <Box className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            {configValues["APP_NAME"]}
          </h1>
        </div>

        <div className="flex flex-col w-full max-w-sm gap-8 bg-card p-10 rounded-3xl border-2 border-border shadow-none transition-all duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black uppercase tracking-tight">
              {t("pages.login.welcome_back") || "AUTHENTIFICATION"}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="h-[2px] w-4 bg-primary rounded-full" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Accès Console Administration
              </p>
              <span className="h-[2px] w-4 bg-primary rounded-full" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="border-t-2 border-border pt-6">
              <OAuth message="pages.login.login_button_google" />
            </div>

            <p className="text-center text-[9px] font-medium text-muted-foreground leading-relaxed uppercase tracking-tighter opacity-60">
              En vous connectant, vous acceptez les protocoles de sécurité <br/>
              et les conditions d'utilisation de la plateforme.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-black opacity-20 uppercase tracking-[0.5em]">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Secure Shell Access Enabled
        </div>
      </div>
  );
};