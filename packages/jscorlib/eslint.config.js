// @ts-check
import * as JscorlibLinters from "@jscorlib-repo/linters";
import { defineConfig } from "eslint/config";

export default defineConfig(
  ...JscorlibLinters.ESLintRules.baseConfig,
);
