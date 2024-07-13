import { describe, expect, it } from "vitest";
import * as _Collections from "../hashSet";
import { sort } from "../../arrays";

function populateSet(set: Set<string>): void {
  set.add("username");
  set.add("productID");
  set.add("orderNumber");
}

describe("HashSet", () => {
  it("add / delete", () => {
    const set = new _Collections.HashSet<string>();
    expect(set.has("username")).toBe(false);
    set.add("username");
    expect(set.has("username")).toBe(true);
    set.delete("username");
    expect(set.has("username")).toBe(false);
  });

  it("size", () => {
    const set = new _Collections.HashSet<string>();
    populateSet(set);
    expect(set.size).toBe(3);
    set.clear();
    expect(set.size).toBe(0);
    populateSet(set);
    expect(set.size).toBe(3);
  });

  it("iterate", () => {
    const set = new _Collections.HashSet<string>();
    populateSet(set);
    expect([...set]).toStrictEqual(["username", "productID", "orderNumber"]);
  });

  it("distinguishes between +0 / -0 by default", () => {
    const set = _Collections.HashSet.from<number>([+0, -0, 1, 2, 3, 0]);
    const setArray = [...set];
    sort(setArray);
    expect(setArray).toStrictEqual([-0, 0, 1, 2, 3]);
  });
});
