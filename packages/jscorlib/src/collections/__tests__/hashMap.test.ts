import { describe, expect, it } from "vitest";
import * as _Collections from "../hashMap";

function populateMap(map: Map<string, number>): void {
  map.set("username", 1);
  map.set("productID", 2);
  map.set("orderNumber", 3);
}

describe("HashMap", () => {
  it("add / delete", () => {
    const map = new _Collections.HashMap<string, number>();
    const key = "username";
    expect(map.has(key)).toBe(false);
    expect(map.get(key)).toBeUndefined();
    map.set(key, 1);
    expect(map.has(key)).toBe(true);
    expect(map.get(key)).toBe(1);
    map.delete(key);
    expect(map.has(key)).toBe(false);
    expect(map.get(key)).toBeUndefined();
  });

  it("size", () => {
    const map = new _Collections.HashMap<string, number>();
    populateMap(map);
    expect(map.size).toBe(3);
    map.clear();
    expect(map.size).toBe(0);
    populateMap(map);
    expect(map.size).toBe(3);
  });

  it("get or insert", () => {
    const map = new _Collections.HashMap<string, number | undefined>();
    map.set("existing", undefined);
    expect(map.getOrInsert("existing", 1)).toBeUndefined();
    expect(map.getOrInsert("default", 2)).toBe(2);

    let callbackCalls = 0;
    expect(map.getOrInsertComputed("default", () => ++callbackCalls)).toBe(2);
    expect(map.getOrInsertComputed("computed", () => ++callbackCalls)).toBe(1);
    expect(callbackCalls).toBe(1);
  });

  it("iterate", () => {
    const map = new _Collections.HashMap<string, number>();
    populateMap(map);
    expect([...map.keys()]).toStrictEqual(["username", "productID", "orderNumber"]);
    expect([...map.values()]).toStrictEqual([1, 2, 3]);
    expect([...map.entries()]).toStrictEqual([["username", 1], ["productID", 2], ["orderNumber", 3]]);
  });
});
