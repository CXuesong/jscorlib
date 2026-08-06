import { describe, expect, it } from "vitest";
import { LruCache } from "../lruCache";

describe("LruCache", () => {
  it("get or insert refreshes recency", () => {
    const cache = new LruCache<string, number>(2);
    cache.set("first", 1);
    cache.set("second", 2);

    expect(cache.getOrInsertComputed("first", () => 3)).toBe(1);
    expect(cache.getOrInsert("third", 3)).toBe(3);
    expect([...cache.entries()]).toStrictEqual([["third", 3], ["first", 1]]);
    expect(cache.has("second")).toBe(false);

    expect(cache.delete("first")).toBe(true);
    expect(cache.has("first")).toBe(false);
  });
});