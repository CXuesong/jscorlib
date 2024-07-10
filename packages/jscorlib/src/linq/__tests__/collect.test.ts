import { describe, expect, it } from "vitest";
import * as Collect from "../collect";
import * as CollectHashMap from "../collectHashMap";
import * as CollectHashSet from "../collectHashSet";
import { asLinq, registerLinqModule } from "../linqWrapper";

registerLinqModule(Collect);
registerLinqModule(CollectHashMap);
registerLinqModule(CollectHashSet);

describe("collect", () => {
  it("toArray", () => {
    const arr = [1, 2, 3, "a", "b", "c"];
    expect(asLinq(arr).toArray()).toStrictEqual(arr);
  });
  it("toMap", () => {
    const arr = [1, 2, 3, "a", "b", "c"];

    const map1 = asLinq(arr).toMap(x => typeof x);
    expect(map1).toStrictEqual(new Map<string, string | number>([
      ["number", 3],
      ["string", "c"],
    ]));
    const map2 = asLinq(arr).toMap(x => x, x => typeof x);
    expect(map2).toStrictEqual(new Map<string | number, string>([
      [1, "number"],
      [2, "number"],
      [3, "number"],
      ["a", "string"],
      ["b", "string"],
      ["c", "string"],
    ]));

    const hashMap1 = asLinq(arr).toHashMap(x => typeof x);
    expect(new Map(hashMap1)).toStrictEqual(map1);
    const hashMap2 = asLinq(arr).toHashMap(x => x, x => typeof x);
    expect(new Map(hashMap2)).toStrictEqual(map2);
  });
  it("toSet", () => {
    const arr1 = [1, 2, 3, "a", "b", "c"];
    const arr2 = [1, 2, 2, 3, "a"];

    const set1 = asLinq(arr1).toSet();
    expect(set1).toStrictEqual(new Set(arr1));
    const set2 = asLinq(arr2).toSet();
    expect(set2).toStrictEqual(new Set([1, 2, 3, "a"]));

    const hashSet1 = asLinq(arr1).toHashSet();
    expect(new Set(hashSet1)).toStrictEqual(new Set(arr1));
    const hashSet2 = asLinq(arr2).toHashSet();
    expect(new Set(hashSet2)).toStrictEqual(new Set([1, 2, 3, "a"]));
  });
});
