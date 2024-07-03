import { assert } from "../diagnostics";
import { checkArgumentType, InvalidOperationError } from "../errors";
import type { LinqWrapper } from "./linqWrapper";

export type AggregateAccumulator<T, TAccumulate> = (accumulate: TAccumulate, element: T) => TAccumulate;

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    aggregate<TAccumulate>(seed: TAccumulate, accumulator: AggregateAccumulator<T, TAccumulate>): TAccumulate;
    aggregate(accumulator: AggregateAccumulator<T, T>): T;
  }
}

const MissingValueSymbol = Symbol("MissingValue");

export function Linq$aggregate<T, TAccumulate>(
  this: LinqWrapper<T>,
  arg1: TAccumulate | AggregateAccumulator<T, T>,
  accumulator?: AggregateAccumulator<T, TAccumulate>,
): TAccumulate {
  const [seed, acc] = accumulator
    ? [arg1 as TAccumulate, accumulator] as const
    : [MissingValueSymbol, arg1 as AggregateAccumulator<T, TAccumulate>] as const;
  checkArgumentType(accumulator ? 1 : 0, "accumulator", acc, "function");
  let cur = seed;
  for (const e of this.unwrap()) {
    if (cur == MissingValueSymbol) {
      // This means T == TAccumulate
      cur = e as unknown as TAccumulate;
      assert(cur !== MissingValueSymbol);
      continue;
    }

    cur = acc(cur, e);
  }
  if (cur == MissingValueSymbol) throw new InvalidOperationError("Sequence contains no element as initial value.");
  return cur;
}
