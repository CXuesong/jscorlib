import type { LinqWrapper } from "./linqWrapper";
import { IntermediateLinqWrapper } from "./linqWrapper.internal";
import { IndexedSequenceElementPredicate, SequenceElementTypeAssertionPredicate } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    where<TReturn extends T>(predicate: SequenceElementTypeAssertionPredicate<T, TReturn>): LinqWrapper<TReturn>;
    where(predicate: IndexedSequenceElementPredicate<T>): LinqWrapper<T>;
  }
}

export function Linq$where<T>(this: LinqWrapper<T>, predicate: IndexedSequenceElementPredicate<T>): LinqWrapper<T> {
  // n.b. Even if `this` is empty upon the time of invocation of this function,
  // `this` may have items when iterator gets enumerated later.
  if (this instanceof WhereLinqWrapper) {
    const state = this.__state;
    return new WhereLinqWrapper<T>({
      ...state,
      predicates: [...state.predicates, predicate],
    }).asLinq();
  }
  return new WhereLinqWrapper({
    iterable: this.unwrap(),
    predicates: [predicate],
  }).asLinq();
}

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
