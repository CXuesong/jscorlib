// @ts-check
import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";
import { repoRootDir } from "../environment.js";

export const baseConfig = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: repoRootDir,
      },
    },
    rules: {
      "@typescript-eslint/array-type": ["error", {
        default: "array-simple",
        readonly: "array-simple",
      }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          // https://github.com/tc39/proposal-discard-binding
          "varsIgnorePattern": "^_void",
          "ignoreRestSiblings": true,
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": "error",
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error", {
          ignorePrimitives: {
            string: true,
          },
        },
      ],
      "@typescript-eslint/no-inferrable-types": [
        "error", {
          ignoreParameters: true,
          ignoreProperties: true,
        },
      ],
      // This rule does not handle `unknown` well
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
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
      "@stylistic/eol-last": ["error", "always"],
    },
  },
  {
    plugins: {
      jsdoc,
    },
    rules: {
      "jsdoc/no-undefined-types": ["warn", {
        markVariablesAsUsed: true,
        disableReporting: true,
      }],
    },
  },
);
