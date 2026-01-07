import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthContextProvider } from "./contexts/authContext";
import { ThemeProvider } from "./providers/theme-provider";
import { SocketProvider } from "./contexts/socketContext";
import { ConfigProvider } from "./contexts/configContext";
import { AppInitializer } from "./initializer";
import "./lib/i18n";
import "./styles/index.css";

if (!import.meta.env.VITE_API_URL) {
  console.warn("⚠️ VITE_API_URL n'est pas définie. Le fallback http://localhost:5001 sera utilisé via axiosConfig.");
}

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ConfigProvider>
          <AuthContextProvider>
            <AppInitializer>
              <BrowserRouter>
                <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                  <App />
                  <Toaster />
                </ThemeProvider>
              </BrowserRouter>
            </AppInitializer>
          </AuthContextProvider>
        </ConfigProvider>
      </React.StrictMode>,
  );
}