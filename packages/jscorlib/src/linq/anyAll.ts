import { PipeBody, PipeFunction } from "../pipables";
import type { LinqWrapper } from "./linqWrapper";
import { SequenceElementPredicate } from "./typing";

export function any<T>(
  predicate?: SequenceElementPredicate<T>,
): PipeBody<LinqWrapper<T>, boolean> {
  return target => {
    if (predicate) {
      for (const e of target.unwrap()) {
        if (predicate(e)) return true;
      }
      return false;
    }

    for (const e of target.unwrap()) {
      return true;
    }
    return false;
  };
}
any satisfies PipeFunction;

export function all<T>(
  predicate: SequenceElementPredicate<T>,
): PipeBody<LinqWrapper<T>, boolean> {
  return target => {
    for (const e of target.unwrap()) {
      if (!predicate(e)) return false;
    }
    return true;
  };
}
all satisfies PipeFunction;
