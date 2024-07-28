import { defaultArrayComparer } from "../../arrays";
import { ComparerFunction } from "../../collections/comparison";
import { fail } from "../../diagnostics";
import { InvalidOperationError } from "../../errors";
import type { LinqWrapper } from "../linqWrapper";
import { SequenceElementSelector } from "./typing";
import { unwrapUnorderedLinqWrapper } from "../internal";
import { PipeBody, PipeFunction } from "../../pipables";

export function min<T>(comparer?: ComparerFunction<T>): PipeBody<LinqWrapper<T>, T> {
  return target => minMaxImpl(target, "min", undefined, comparer);
}
min satisfies PipeFunction;

export function minBy<T, TKey>(keySelector: SequenceElementSelector<T, TKey>, comparer?: ComparerFunction<TKey>): PipeBody<LinqWrapper<T>, T> {
  return target => minMaxImpl(target, "min", keySelector, comparer);
}
minBy satisfies PipeFunction;

export function max<T>(comparer?: ComparerFunction<T>): PipeBody<LinqWrapper<T>, T> {
  return target => minMaxImpl(target, "max", undefined, comparer);
}
max satisfies PipeFunction;

export function maxBy<T, TKey>(keySelector: SequenceElementSelector<T, TKey>, comparer?: ComparerFunction<TKey>): PipeBody<LinqWrapper<T>, T> {
  return target => minMaxImpl(target, "max", keySelector, comparer);
}
maxBy satisfies PipeFunction;

function minMaxImpl<T, TKey = T>(
  wrapper: LinqWrapper<T>,
  mode: "min" | "max",
  keySelector?: SequenceElementSelector<T, TKey>,
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
