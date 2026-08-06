import { beforeAll } from "vitest";

beforeAll(async () => {
  // Temporal is available by default since Node 26+
  await import("temporal-polyfill/global");
});
