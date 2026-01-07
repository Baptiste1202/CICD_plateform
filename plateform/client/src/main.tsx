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