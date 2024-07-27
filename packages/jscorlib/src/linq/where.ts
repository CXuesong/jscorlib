import { PipeBody, PipeFunction } from "../pipables";
import type { LinqWrapper } from "./linqWrapper";
import { IntermediateLinqWrapper } from "./linqWrapper.internal";
import { IndexedSequenceElementPredicate, SequenceElementTypeAssertionPredicate } from "./typing";

export function where<T, TReturn extends T>(predicate: SequenceElementTypeAssertionPredicate<T, TReturn>): PipeBody<LinqWrapper<T>,LinqWrapper<TReturn>>;
export function where<T>(predicate: IndexedSequenceElementPredicate<T>): PipeBody<LinqWrapper<T>,LinqWrapper<T>>;
export function where<T>(predicate: IndexedSequenceElementPredicate<T>): PipeBody<LinqWrapper<T>,LinqWrapper<T>> {
  // n.b. Even if `this` is empty upon the time of invocation of this function,
  // `this` may have items when iterator gets enumerated later.
  return target => {
    if (target instanceof WhereLinqWrapper) {
      const state = target.__state;
      return new WhereLinqWrapper<T>({
        ...state,
        predicates: [...state.predicates, predicate],
      }).asLinq();
    }
    return new WhereLinqWrapper({
      iterable: target.unwrap(),
      predicates: [predicate],
    }).asLinq();
  };
}
where satisfies PipeFunction;

interface WhereIteratorInfo<T> {
  readonly iterable: Iterable<T>;
  predicates: ReadonlyArray<IndexedSequenceElementPredicate<T>>;
}

class WhereLinqWrapper<T> extends IntermediateLinqWrapper<T, WhereIteratorInfo<T>> {
  public override *[Symbol.iterator](): Iterator<T> {
    const { iterable, predicates } = this.__state;
    const indices = new Array<number>(predicates.length).fill(0);
    ELEMENT: for (const e of iterable) {
      for (let j = 0; j < predicates.length; j++) {
        const passed = predicates[j](e, indices[j]);
        indices[j]++;
        if (!passed) continue ELEMENT;
      }
      // Passed all predicates
      yield e;
    }
  }
}
