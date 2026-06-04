// Flat ESLint config for DespegueShip.
// Built on top of eslint-config-next 16.2.5 (which provides Next.js,
// React 19, and core-web-vitals rules).
//
// Reference: https://eslint.org/docs/latest/use/configure/configuration-files
//            https://nextjs.org/docs/app/api-reference/config/eslint

import nextPlugin from "@next/eslint-plugin-next";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "coverage/**",
      ".lighthouseci/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
];
