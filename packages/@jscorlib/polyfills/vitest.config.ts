import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    target: "node22",
  },
  test: {
    include: [
      "**/__tests__/*.test.(ts|js)",
    ],
    benchmark: {
      include: [
        "**/__benchmarks__/*.test.(ts|js)",
      ],
    },
    coverage: {
      provider: "v8",
      reporter: ["lcov"],
      reportsDirectory: "./obj/coverage",
    },
  },
});
