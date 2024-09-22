import { beforeAll } from "vitest";

beforeAll(async () => {
  await import("temporal-polyfill/global");
});
