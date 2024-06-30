import { describe, expect, it } from "vitest";
import * as Count from "../count";
import { asLinq, registerLinqModule } from "../linqWrapper";
import * as Sort from "../sort";

registerLinqModule(Sort);
registerLinqModule(Count);

describe("sort", () => {
  it("orderBy", () => {
    const ordered = asLinq([3, 1, 2]).orderBy(x => x);
    expect([...ordered]).toEqual([1, 2, 3]);
  });
  
  it("orderByDescending", () => {
    const ordered = asLinq([3, 1, 2]).orderByDescending(x => x);
    expect([...ordered]).toEqual([3, 2, 1]);
  });
  
  it("thenBy", () => {
    const linq = asLinq([
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 },
      { name: "Alice", age: 30 },
    ]);
    const ordered = linq.orderBy(x => x.name).thenBy(x => x.age);
    expect([...ordered]).toEqual([
      { name: "Alice", age: 25 },
      { name: "Alice", age: 30 },
      { name: "Bob", age: 30 },
    ]);
  });
  
  it("thenByDescending", () => {
    const linq = asLinq([
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 },
      { name: "Alice", age: 30 },
    ]);
    const ordered = linq.orderBy(x => x.name).thenByDescending(x => x.age);
    expect([...ordered]).toEqual([
      { name: "Alice", age: 30 },
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 },
    ]);
  });
});
