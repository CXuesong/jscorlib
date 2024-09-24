// @ts-check
import * as JscorlibLinters from "@jscorlib-repo/linters";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...JscorlibLinters.ESLintRules.baseConfig,
);
