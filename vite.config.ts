import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json" with { type: "json" };

// https://vite.dev/config/
export default defineConfig({
  base: "/zula-app/",
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),

      react: resolve(import.meta.dirname, "node_modules", "react"),
      "react-dom": resolve(import.meta.dirname, "node_modules", "react-dom"),
    },
  },
  plugins: [react()],
});
