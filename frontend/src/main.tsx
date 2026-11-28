import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Fonts are bundled with the app (no CDN) so it works fully offline.
import "@fontsource-variable/figtree";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";

import "./styles/tokens.css";
import "./styles/base.css";

import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);