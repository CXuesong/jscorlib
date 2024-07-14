import { isTypedArray } from "util/types";
import { LinqWrapper } from "./linqWrapper";
import { IndexedSequenceElementCallback } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    forEach(callback: IndexedSequenceElementCallback<T>): void;
  }
}

export function Linq$forEach<T>(this: LinqWrapper<T>, callback: IndexedSequenceElementCallback<T>): void {
  const unwrapped = this.unwrap();

  // Perf optimization for arrays
  if (Array.isArray(unwrapped) || isTypedArray(unwrapped)) {
    for (let i = 0; i < unwrapped.length; i++) {
      callback(unwrapped[i] as T, i);
    }
    return;
  }

  // General iteration.
  let index = 0;
  for (const e of unwrapped) {
    callback(e, index);
    index++;
  }
}
