import { describe, expect, it } from "vitest";
import * as _Collect from "../collect";
import * as _CollectHashMap from "../collectHashMap";
import * as _CollectHashSet from "../collectHashSet";
import { asLinq } from "../../linqWrapper";

describe("collect", () => {
  it("toArray", () => {
    const arr = [1, 2, 3, "a", "b", "c"];
    expect(asLinq(arr).$(_Collect.toArray())).toStrictEqual(arr);
  });
  it("toMap", () => {
    const arr = [1, 2, 3, "a", "b", "c"];

    const map1 = asLinq(arr).$(_Collect.toMap(x => typeof x));
    expect(map1).toStrictEqual(new Map<string, string | number>([
      ["number", 3],
      ["string", "c"],
    ]));
    const map2 = asLinq(arr).$(_Collect.toMap(x => x, x => typeof x));
    expect(map2).toStrictEqual(new Map<string | number, string>([
      [1, "number"],
      [2, "number"],
      [3, "number"],
      ["a", "string"],
      ["b", "string"],
      ["c", "string"],
    ]));

    const hashMap1 = asLinq(arr).$(_CollectHashMap.toHashMap(x => typeof x));
    expect(new Map(hashMap1)).toStrictEqual(map1);
    const hashMap2 = asLinq(arr).$(_CollectHashMap.toHashMap(x => x, x => typeof x));
    expect(new Map(hashMap2)).toStrictEqual(map2);
  });
  it("toSet", () => {
    const arr1 = [1, 2, 3, "a", "b", "c"];
    const arr2 = [1, 2, 2, 3, "a"];

    const set1 = asLinq(arr1).$(_Collect.toSet());
    expect(set1).toStrictEqual(new Set(arr1));
    const set2 = asLinq(arr2).$(_Collect.toSet());
    expect(set2).toStrictEqual(new Set([1, 2, 3, "a"]));

    const hashSet1 = asLinq(arr1).$(_CollectHashSet.toHashSet());
    expect(new Set(hashSet1)).toStrictEqual(new Set(arr1));
    const hashSet2 = asLinq(arr2).$(_CollectHashSet.toHashSet());
    expect(new Set(hashSet2)).toStrictEqual(new Set([1, 2, 3, "a"]));
  });
});
