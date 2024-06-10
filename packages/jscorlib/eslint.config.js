// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import * as JscorlibLinters from "@jscorlib-repo/linters";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: JscorlibLinters.repoRootDir,
      },
    },
  },
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/indent": ["error", 2],
      "@stylistic/quotes": ["error", "double", {
        "avoidEscape": true,
        "allowTemplateLiterals": true,
      }],
      "@stylistic/semi": "error",
      "@stylistic/comma-dangle": ["error", "always-multiline"],
    },
  },
);
