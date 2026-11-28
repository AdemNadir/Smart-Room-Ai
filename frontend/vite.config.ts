import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Everything is bundled locally: the app must work with no internet access.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    host: true,
    port: 5173,
    // During development the API runs on the backend port; same-origin in production.
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
});
