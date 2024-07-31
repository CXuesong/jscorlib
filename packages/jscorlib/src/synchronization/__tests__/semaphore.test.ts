import { describe, expect, it } from "vitest";
import * as _Synchronization from "../semaphore";
import { InvalidOperationError } from "../../errors";

describe("Semaphore", () => {
  it("basic traits", () => {
    const s = new _Synchronization.Semaphore(3, 5);
    expect(s.count).toBe(3);
    expect(s.maxCount).toBe(5);
    expect(s.wait()).toBe(true);
    expect(s.count).toBe(2);
    expect(s.wait()).toBe(true);
    expect(s.count).toBe(1);
    expect(s.wait()).toBe(true);
    expect(s.count).toBe(0);
    expect(s.wait()).toBe(false);
    expect(s.wait()).toBe(false);

    s.release();
    expect(s.count).toBe(1);
    s.release();
    expect(s.count).toBe(2);
    expect(() => s.release(5)).toThrow(InvalidOperationError);
    expect(s.count).toBe(2);
    s.release(3);
    expect(s.count).toBe(5);
    expect(() => s.release()).toThrow(InvalidOperationError);
  });
});
