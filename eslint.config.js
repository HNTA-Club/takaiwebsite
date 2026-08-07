import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import ts from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default defineConfig([
  { ignores: ["dist/", ".astro/", "node_modules/"] },
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts"],
    extends: [ts.configs.recommended],
  },
  astro.configs.recommended,
]);
