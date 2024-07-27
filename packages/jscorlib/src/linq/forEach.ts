import { isTypedArray } from "util/types";
import { LinqWrapper } from "./linqWrapper";
import { IndexedSequenceElementCallback } from "./typing";
import { PipeBody, PipeFunction } from "../pipables";

export function forEach<T>(callback: IndexedSequenceElementCallback<T>): PipeBody<LinqWrapper<T>, void> {
  return target => {
    const unwrapped = target.unwrap();

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
  };
}
forEach satisfies PipeFunction;
