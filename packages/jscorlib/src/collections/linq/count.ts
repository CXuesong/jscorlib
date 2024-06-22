import type { LinqWrapper } from "./linqWrapper";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> extends LinqWrapperBase<T> {
    count(): number;
    tryGetCountDirect(): number | undefined;
  }
}

function tryGetCountDirect<T>(iterable: Iterable<T>): number | undefined {
  // TODO Not sure why TS thinks unwrapped turns to never.
  if (typeof iterable === "string") return (iterable as string).length;
  if (Array.isArray(iterable)) return iterable.length;
  if (ArrayBuffer.isView(iterable) && "length" in iterable) {
    const length = (iterable as Int32Array).length;
    if (typeof length === "number") return length;
  }
  if (iterable instanceof Map) return iterable.size;
  if (iterable instanceof Set) return iterable.size;
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
