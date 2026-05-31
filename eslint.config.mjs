import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Warn when hardcoded hex colors appear in inline style objects.
    // Use CSS variables from globals.css instead: var(--color-brand-800) etc.
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXAttribute[name.name='style'] ObjectExpression > Property > Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message:
            "Hardcoded hex color in inline style. Use a CSS variable token instead (e.g. var(--color-brand-800)). See app/globals.css for the full list.",
        },
      ],
    },
  },
]);

export default eslintConfig;
