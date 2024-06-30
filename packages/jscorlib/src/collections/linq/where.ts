import type { LinqWrapper } from "./linqWrapper";
import { AbstractLinqWrapper } from "./linqWrapper.internal";
import { SequenceElementPredicate, SequenceElementTypeAssertionPredicate } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    where<TReturn extends T>(predicate: SequenceElementTypeAssertionPredicate<T, TReturn>): LinqWrapper<TReturn>;
    where(predicate: SequenceElementPredicate<T>): LinqWrapper<T>;
  }
}

const WhereIteratorInfoSymbol = Symbol("WhereIteratorInfo");

interface WhereIteratorInfo<T> {
  readonly iterable: Iterable<T>;
  predicates: ReadonlyArray<SequenceElementPredicate<T>>;
}

export function Linq$where<T>(this: LinqWrapper<T>, predicate: SequenceElementPredicate<T>): LinqWrapper<T> {
  // n.b. Even if `this` is empty upon the time of invocation of this function,
  // `this` may have items when iterator gets enumerated later.
  if (this instanceof WhereLinqWrapper) {
    const thisInfo = this[WhereIteratorInfoSymbol];
    return new WhereLinqWrapper<T>({
      ...thisInfo,
      predicates: [...thisInfo.predicates, predicate],
    }).asLinq();
  }
  return new WhereLinqWrapper({
    iterable: this.unwrap(),
    predicates: [predicate],
  }).asLinq();
}

class WhereLinqWrapper<T> extends AbstractLinqWrapper<T> {
  public [WhereIteratorInfoSymbol]: WhereIteratorInfo<T>;
  public constructor(info: WhereIteratorInfo<T>) {
    super();
    this[WhereIteratorInfoSymbol] = info;
  }
  public override *[Symbol.iterator](): Iterator<T> {
    const { iterable, predicates } = this[WhereIteratorInfoSymbol];
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
