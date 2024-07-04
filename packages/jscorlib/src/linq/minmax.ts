import { defaultArrayComparer } from "../arrays";
import { ComparerFunction } from "../collections/comparison";
import { fail } from "../diagnostics";
import { InvalidOperationError } from "../errors";
import type { LinqWrapper } from "./linqWrapper";
import { SequenceElementSimpleSelector } from "./typing";
import { unwrapUnorderedLinqWrapper } from "./utils.internal";

export type AggregateAccumulator<T, TAccumulate> = (accumulate: TAccumulate, element: T) => TAccumulate;

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    min(comparer?: ComparerFunction<T>): T;
    minBy<TKey>(keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey>): T;
    max(comparer?: ComparerFunction<T>): T;
    maxBy<TKey>(keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey>): T;
  }
}

export function Linq$min<T>(this: LinqWrapper<T>, comparer?: ComparerFunction<T>): T {
  return minMaxImpl(this, "min", undefined, comparer);
}

export function Linq$minBy<T, TKey>(this: LinqWrapper<T>, keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey>): T {
  return minMaxImpl(this, "min", keySelector, comparer);
}

export function Linq$max<T>(this: LinqWrapper<T>, comparer?: ComparerFunction<T>): T {
  return minMaxImpl(this, "max", undefined, comparer);
}

export function Linq$maxBy<T, TKey>(this: LinqWrapper<T>, keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey>): T {
  return minMaxImpl(this, "max", keySelector, comparer);
}

function minMaxImpl<T, TKey = T>(
  wrapper: LinqWrapper<T>,
  mode: "min" | "max",
  keySelector?: SequenceElementSimpleSelector<T, TKey>,
  comparer?: ComparerFunction<TKey>,
): T {
  comparer ??= defaultArrayComparer;
  const unwrapped = unwrapUnorderedLinqWrapper(wrapper);
  let cur: [TKey, T] | undefined = undefined;
  if (mode === "min") {
    if (keySelector) {
      for (const e of unwrapped) {
        if (!cur) {
          cur = [keySelector(e), e];
          continue;
        }

        const key = keySelector(e);
        // cur > e
        if (comparer(cur[0], key) > 0) cur = [key, e];
      }
    } else {
      for (const e of unwrapped) {
        if (!cur) {
          cur = [undefined!, e];
          continue;
        }

        // cur > e
        if ((comparer as unknown as ComparerFunction<T>)(cur[1], e) > 0) cur = [undefined!, e];
      }
    }
  } else if (mode === "max") {
    if (keySelector) {
      for (const e of unwrapped) {
        if (!cur) {
          cur = [keySelector(e), e];
          continue;
        }

        const key = keySelector(e);
        // cur < e
        if (comparer(cur[0], key) < 0) cur = [key, e];
      }
    } else {
      for (const e of unwrapped) {
        if (!cur) {
          cur = [undefined!, e];
          continue;
        }

        // cur < e
        if ((comparer as unknown as ComparerFunction<T>)(cur[1], e) < 0) cur = [undefined!, e];
      }
    }
  } else {
    fail();
  }

  if (cur == undefined) throw new InvalidOperationError("Sequence contains no element.");
  return cur[1];
}
