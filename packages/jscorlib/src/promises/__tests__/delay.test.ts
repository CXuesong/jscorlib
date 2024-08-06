import { describe, expect, it } from "vitest";
import * as _Promises from "../../promises/delay";

describe("delay", () => {
  it("basic traits", async () => {
    const t1 = performance.now();
    await _Promises.delay(500);
    const t2 = performance.now();
    expect(t2 - t1).toBeGreaterThanOrEqual(500);
  });
});
