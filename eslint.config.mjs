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
    rules: {
      // Disable Tailwind CSS class name suggestions
      "@tailwindcss/classnames-order": "off",
      "@tailwindcss/enforces-negative-arbitrary-values": "off",
      "@tailwindcss/enforces-shorthand": "off",
      "@tailwindcss/migration-from-tailwind-2": "off",
      "@tailwindcss/no-arbitrary-value": "off",
      "@tailwindcss/no-contradicting-classname": "off",
      "@tailwindcss/no-custom-classname": "off",
      "@tailwindcss/no-unnecessary-arbitrary-value": "off",
    },
  },
]);

export default eslintConfig;
