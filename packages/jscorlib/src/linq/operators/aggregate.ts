import { assert } from "../../diagnostics";
import { checkArgumentType, InvalidOperationError } from "../../errors";
import { PipeBody, PipeFunction } from "../../pipables";
import type { LinqWrapper } from "../linqWrapper";

export type AggregateAccumulator<T, TAccumulate> = (accumulate: TAccumulate, element: T) => TAccumulate;

const MissingValueSymbol = Symbol("MissingValue");

export function aggregate<T, TAccumulate>(seed: TAccumulate, accumulator: AggregateAccumulator<T, TAccumulate>): PipeBody<LinqWrapper<T>, TAccumulate>;
export function aggregate<T>(accumulator: AggregateAccumulator<T, T>): PipeBody<LinqWrapper<T>, T>;
export function aggregate<T, TAccumulate>(
  arg1: TAccumulate | AggregateAccumulator<T, T>,
  accumulator?: AggregateAccumulator<T, TAccumulate>,
): PipeBody<LinqWrapper<T>, TAccumulate> {
  return target => {
    const [seed, acc] = accumulator
      ? [arg1 as TAccumulate, accumulator] as const
      : [MissingValueSymbol, arg1 as AggregateAccumulator<T, TAccumulate>] as const;
    checkArgumentType(accumulator ? 1 : 0, "accumulator", acc, "function");
    let cur = seed;
    for (const e of target.unwrap()) {
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
  };
}
aggregate satisfies PipeFunction;
