import { describe, expect, it } from "vitest";
import { DisposableStack } from "../disposableStack";

describe("DisposableStack", () => {
  it("simple", () => {
    const ds = new DisposableStack();
    const cleanupTrace: string[] = [];

    expect(ds.disposed).toBe(false);
    populateDisposableStack(ds, cleanupTrace);
    expect(ds.disposed).toBe(false);

    ds.dispose();
    expect(ds.disposed).toBe(true);
    expect(cleanupTrace).toStrictEqual(expectedDisposalOrder);

    // Any further `dispose` will be no-op.
    ds.dispose();
    expect(ds.disposed).toBe(true);
    expect(cleanupTrace).toStrictEqual(expectedDisposalOrder);

    expect(() => ds.defer(() => { /**/ })).toThrowError(ReferenceError);
  });

  it("`using` clause", () => {
    const cleanupTrace: string[] = [];
    {
      using ds = new DisposableStack();
      populateDisposableStack(ds, cleanupTrace);
    }
    expect(cleanupTrace).toStrictEqual(expectedDisposalOrder);
  });
});

const expectedDisposalOrder = [
  // Reversed order
  "Cleanup #3",
  "Cleanup #2",
  "Disposable #3",
  "Cleanup #1",
  "Disposable #2",
  "Disposable #1",
];

function populateDisposableStack(ds: DisposableStack, cleanupTrace: string[]): void {
  ds.use({
    [Symbol.dispose]: () => { cleanupTrace.push("Disposable #1"); },
  });
  ds.use({
    [Symbol.dispose]: () => { cleanupTrace.push("Disposable #2"); },
  });
  ds.defer(() => { cleanupTrace.push("Cleanup #1"); });
  ds.use({
    [Symbol.dispose]: () => { cleanupTrace.push("Disposable #3"); },
  });
  ds.defer(() => { cleanupTrace.push("Cleanup #2"); });
  ds.defer(() => { cleanupTrace.push("Cleanup #3"); });
}
