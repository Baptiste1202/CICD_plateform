import { useAuthContext } from "@/contexts/authContext";
import { useConfigContext } from "@/contexts/configContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { OAuth } from "@/components/customs/oauth";
import { Loader2 } from "lucide-react";

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
        <div className="flex h-svh items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
        </div>
    );
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-2 py-4 md:px-10 md:py-10">
        {/* Titre de l'application */}
        <div className="flex items-center self-center gap-2 text-3xl font-medium sm:text-4xl text-accent">
          {configValues["APP_NAME"] || "Projet Cloud"}
        </div>

        <div className="flex flex-col w-full max-w-md gap-6 bg-background p-8 lg:rounded-2xl lg:shadow border">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("pages.login.welcome_back")}
            </h1>
            <p className="text-sm text-muted-foreground">
              Accédez à votre plateforme de déploiement sécurisée
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* On ne garde que le bouton Google via ton composant OAuth */}
            <OAuth message="pages.login.login_button_google" />

            <p className="px-8 text-center text-xs text-muted-foreground">
              En vous connectant, vous acceptez nos conditions d'utilisation
              et la politique de sécurité du projet.
            </p>
          </div>
        </div>
      </div>
  );
};