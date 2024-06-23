import { isArrayLikeStrict } from "./iteratorUtils";
import type { LinqWrapper } from "./linqWrapper";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> extends LinqWrapperBase<T> {
    count(): number;
    tryGetCountDirect(): number | undefined;
  }
}

function tryGetCountDirect<T>(iterable: Iterable<T>): number | undefined {
  if (isArrayLikeStrict(iterable)) return iterable.length;
  if (iterable instanceof Map || iterable instanceof Set) return iterable.size;
}

export function Linq$count<T>(this: LinqWrapper<T>): number {
  const unwrapped = this.unwrap();
  let count = tryGetCountDirect(unwrapped);
  if (count != null) return count;
  // Slow route
  count = 0;
  for (const _void of unwrapped) count++;
  return count;
}

export function Linq$tryGetCountDirect<T>(this: LinqWrapper<T>): number | undefined {
  return tryGetCountDirect(this.unwrap());
}
