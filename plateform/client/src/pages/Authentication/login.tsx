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
          <Loader2 className="w-10 h-10 animate-spin text-foreground" />
        </div>
    );
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-8 bg-background px-4">

        <div className="flex flex-col items-center gap-4">
          <div className="bg-foreground text-background p-3 rounded-xl border-2 border-foreground shadow-2xl">
            <Box className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            {configValues["APP_NAME"] || "CI/CD Platform"}
          </h1>
        </div>

        <div className="flex flex-col w-full max-w-sm gap-8 bg-card p-10 rounded-2xl border-2 border-border shadow-none">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black uppercase tracking-tight">
              {t("pages.login.welcome_back") || "AUTHENTIFICATION"}
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Accès Console Administration
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="border-t-2 border-border pt-6">
              <OAuth message="pages.login.login_button_google" />
            </div>

            <p className="text-center text-[9px] font-medium text-muted-foreground leading-relaxed uppercase tracking-tighter">
              En vous connectant, vous acceptez les protocoles de sécurité <br/>
              et les conditions d'utilisation de la plateforme.
            </p>
          </div>
        </div>

        <div className="text-[10px] font-black opacity-20 uppercase tracking-[0.5em]">
          Secure Shell Access Enabled
        </div>
      </div>
  );
};