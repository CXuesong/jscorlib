import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    target: "node22",
  },
  test: {
    include: [
      "src/**/__tests__/*.test.(ts|js)",
    ],
    benchmark: {
      include: [
        "src/**/__benchmarks__/*.test.(ts|js)",
      ],
    },
    setupFiles: ["src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["lcov"],
      reportsDirectory: "./obj/coverage",
    },
  },
});
