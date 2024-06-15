import { describe, expect, it } from "vitest";
import * as _Errors from "../aggregateErrorHelpers";
import { ArgumentNullError, ArgumentTypeError } from "../argumentErrors";

describe("flattenAggregateError", () => {
  it("simple", () => {
    const error0 = new AggregateError([], "Empty AggregateError.");
    const error1 = new AggregateError([1, 2, 3, null, undefined]);
    const error2 = new AggregateError([new Error("Test error.")]);
    const myCause = new Error("Causing error.");
    const error012 = new AggregateError(["root", error0, error1, error2], undefined, { cause: myCause });

    let flattened = _Errors.flattenAggregateError(error0);
    expect(flattened).toBeInstanceOf(AggregateError);
    expect(flattened.errors).toStrictEqual([]);

    expect(_Errors.flattenAggregateError(error1).errors).toStrictEqual([1, 2, 3, null, undefined]);
    expect(_Errors.flattenAggregateError(error2).errors).toStrictEqual(error2.errors);

    flattened = _Errors.flattenAggregateError(error012);
    expect(flattened).toBeInstanceOf(AggregateError);
    expect(flattened.errors).toStrictEqual([
      "root",
      ...error0.errors as unknown[],
      ...error1.errors as unknown[],
      ...error2.errors as unknown[],
    ]);
  });

  it("invalid args", () => {
    expect(() => _Errors.flattenAggregateError(undefined as unknown as AggregateError)).toThrow(ArgumentNullError);
    expect(() => _Errors.flattenAggregateError(new Error() as AggregateError)).toThrow(ArgumentTypeError);
  });
});
