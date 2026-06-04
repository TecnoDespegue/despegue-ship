// Vitest config for DespegueShip.
//
// We start with zero tests in v1; the structure is in place so future
// specs (RSC shape, JSON-LD shape, agent data, header assertions) can
// drop into the `tests/` directory without further wiring.
//
// Reference: https://vitest.dev/config/

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "out", "build", "dist"],
    reporters: ["verbose"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
      ],
      exclude: [
        "app/api/csp-report/**",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
      ],
      thresholds: {
        // Per SPEC NFR-02: coverage must be tracked; the threshold
        // is intentionally loose at v1.0.0 and will be tightened as
        // the test suite grows.
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
  },
});
