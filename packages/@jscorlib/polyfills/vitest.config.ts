import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: {
    target: "node24",
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
    coverage: {
      provider: "v8",
      reporter: ["lcov"],
      reportsDirectory: "./obj/coverage",
    },
  },
});
