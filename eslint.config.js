import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Catches a supabase call (or any promise) left un-awaited — the class
      // of bug hit in the export utils.
      "@typescript-eslint/no-floating-promises": "error",
      // Catches async handlers passed where a void handler is expected
      "@typescript-eslint/no-misused-promises": "error",
      // Allow intentionally-unused args/vars prefixed with _.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    }
  },
  {
    files: ["vite.config.ts", "eslint.config.js"],
    languageOptions: {
      globals: globals.node,
      parserOptions: { project: ["./tsconfig.node.json"] },
    },
  },
]);
