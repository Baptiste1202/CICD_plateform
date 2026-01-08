import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { axiosConfig } from "@/config/axiosConfig";

type ConfigMap = Record<string, string>;

interface ConfigContextType {
  configValues: ConfigMap;
  getConfigValue: (keys: string[]) => Promise<ConfigMap>;
  updateConfigValues: (config: ConfigMap) => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [configValues, setConfigValues] = useState<ConfigMap>({});
  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  };

  useEffect(() => {
    if (configValues.ACCENT_COLOR) {
      const root = document.documentElement;
      root.style.setProperty('--dynamic-accent', configValues.ACCENT_COLOR);

      const textColor = getContrastColor(configValues.ACCENT_COLOR);
      root.style.setProperty('--primary-foreground', textColor);
      root.style.setProperty('--accent-foreground', textColor);
    }
    if (configValues.APP_NAME) {
      document.title = configValues.APP_NAME;
    }
  }, [configValues.ACCENT_COLOR, configValues.APP_NAME]);

  const loadConfig = useCallback(
    async (keys: string[]) => {
      const missingKeys = keys.filter((key) => !(key in configValues));
      if (missingKeys.length === 0) {
        return configValues;
      }

      try {
        const res = await axiosConfig.get(`/config?keys=${missingKeys.join(",")}`);
        const foundConfig = res.data.config;

        const configMap: ConfigMap = {};
        const fetchedKeys = new Set<string>();

        for (const c of foundConfig) {
          configMap[c.key] = c.value;
          fetchedKeys.add(c.key);
        }

        for (const key of missingKeys) {
          if (!fetchedKeys.has(key)) {
            if (key === "APP_NAME") {
              configMap[key] = "CI/CD PLATEFORM";
            }
            else if (key === "ACCENT_COLOR") {
              configMap[key] = "#3b82f6";
            }
            else {
              configMap[key] = "";
            }
          }
        }

        setConfigValues((prevConfig) => ({ ...prevConfig, ...configMap }));
        return { ...configValues, ...configMap };
      } catch (err: any) {
        return configValues;
      }
    },
    [configValues],
  );

  const getConfigValue = useCallback(
    async (keys: string[]): Promise<ConfigMap> => {
      return loadConfig(keys);
    },
    [loadConfig],
  );

  const updateConfigValues = useCallback((config: ConfigMap) => {
    setConfigValues((prevConfig) => ({ ...prevConfig, ...config }));
  }, []);

  return <ConfigContext.Provider value={{ configValues, getConfigValue, updateConfigValues }}>{children}</ConfigContext.Provider>;
};

export const useConfigContext = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === null) {
    throw new Error("useConfigContext must be used within a ConfigProvider");
  }
  return context;
};
