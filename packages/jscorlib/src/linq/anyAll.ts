import type { LinqWrapper } from "./linqWrapper";
import { SequenceElementPredicate } from "./typing";

export type AggregateAccumulator<T, TAccumulate> = (accumulate: TAccumulate, element: T) => TAccumulate;

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    any(predicate?: SequenceElementPredicate<T>): boolean;
    all(predicate: SequenceElementPredicate<T>): boolean;
  }
}

export function Linq$any<T>(
  this: LinqWrapper<T>,
  predicate?: SequenceElementPredicate<T>,
): boolean {
  if (predicate) {
    for (const e of this.unwrap()) {
      if (predicate(e)) return true;
    }
    return false;
  }

  for (const e of this.unwrap()) {
    return true;
  }
  return false;
}

export function Linq$all<T>(
  this: LinqWrapper<T>,
  predicate: SequenceElementPredicate<T>,
): boolean {
  for (const e of this.unwrap()) {
    if (!predicate(e)) return false;
  }
  return true;
}
