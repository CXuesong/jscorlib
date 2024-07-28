import { describe, expect, it } from "vitest";
import * as _Linq from "../groupBy";
import { asLinq } from "../../linqWrapper";

function collectGroups<TKey, TValue>(groups: Iterable<_Linq.LinqGrouping<TKey, TValue>>): Map<TKey, TValue[]> {
  const map = new Map<TKey, TValue[]>();
  for (const g of groups) {
    expect(map.has(g.key)).toBeFalsy();
    map.set(g.key, [...g.values]);
  }
  return map;
}

describe("groupBy", () => {
  it("groupBy", () => {
    // A list of names pulled from New Bing.
    const names = [
      "James Smith",
      "Michael Smith",
      "Robert Smith",
      "Maria Garcia",
      "David Smith",
      "Maria Rodriguez",
      "Mary Smith",
      "Maria Hernandez",
      "Maria Martinez",
      "Robert Johnson",
    ];
    const byFirstName = asLinq(names).$(_Linq.groupBy(n => n.split(" ")[0]));
    const byLastName = asLinq(names).$(_Linq.groupBy(n => n.split(" ")[1]));
    expect(collectGroups(byFirstName)).toEqual(new Map([
      ["James", ["James Smith"]],
      ["Michael", ["Michael Smith"]],
      ["Robert", ["Robert Smith", "Robert Johnson"]],
      ["Maria", ["Maria Garcia", "Maria Rodriguez", "Maria Hernandez", "Maria Martinez"]],
      ["David", ["David Smith"]],
      ["Mary", ["Mary Smith"]],
    ]));
    expect(collectGroups(byLastName)).toEqual(new Map([
      ["Smith", ["James Smith", "Michael Smith", "Robert Smith", "David Smith", "Mary Smith"]],
      ["Garcia", ["Maria Garcia"]],
      ["Rodriguez", ["Maria Rodriguez"]],
      ["Hernandez", ["Maria Hernandez"]],
      ["Martinez", ["Maria Martinez"]],
      ["Johnson", ["Robert Johnson"]],
    ]));
  });
});
