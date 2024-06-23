import { expect } from "vitest";

export function expectSign(value: number) {
  return expect(Math.sign(value));
}
