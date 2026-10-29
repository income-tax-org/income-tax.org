import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    // Default. Files that exercise browser-only APIs opt into jsdom with a
    // `@vitest-environment jsdom` docblock.
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/utils/**",
        "src/hooks/**",
        "src/data-loaders/**",
        "src/constants/**",
      ],
      // Tax data is verified by scripts/validate-tax-data.ts, not by unit tests.
      exclude: ["src/data/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
