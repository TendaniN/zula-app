import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/zula/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),

      react: resolve(__dirname, "node_modules", "react"),
      "react-dom": resolve(__dirname, "node_modules", "react-dom"),
    },
  },
  plugins: [react()],
});
