import { tryGetCountDirect } from "./count";
import { asLinq, LinqWrapper } from "./linqWrapper";
import { IntermediateLinqWrapper, IterableFactoryLinqWrapper } from "./linqWrapper.internal";
import { BuiltInLinqTraits, TryGetCountDirectSymbol } from "./traits";
import { IndexedSequenceElementSelector } from "./typing";
import { PipeBody, PipeFunction } from "../pipables";

export function select<T, TResult>(selector: IndexedSequenceElementSelector<T, TResult>): PipeBody<LinqWrapper<T>, LinqWrapper<TResult>> {
  return target => {
    if (target instanceof SelectLinqWrapper) {
      const state = target.__state;
      return new SelectLinqWrapper<T, TResult>({
        ...state,
        selectors: [
          ...state.selectors,
          { selector: selector as IndexedSequenceElementSelector<unknown, unknown> },
        ],
      }).asLinq();
    }

    return new SelectLinqWrapper<T, TResult>({
      iterable: target.unwrap(),
      selectors: [{ selector: selector as IndexedSequenceElementSelector<unknown, unknown> }],
    }).asLinq();
  };
}
select satisfies PipeFunction;

export function selectMany<T, TResult>(selector: IndexedSequenceElementSelector<T, Iterable<TResult>>): PipeBody<LinqWrapper<T>, LinqWrapper<TResult>> {
  return target => {
    const unwrapped = target.unwrap();
    return new IterableFactoryLinqWrapper(() => selectManyIterable(unwrapped, selector)).asLinq();
  };
}
selectMany satisfies PipeFunction;

function* selectManyIterable<T, TResult>(iterable: Iterable<T>, selector: IndexedSequenceElementSelector<T, Iterable<TResult>>): Iterable<TResult> {
  let index = 0;
  for (const e of iterable) {
    yield* selector(e, index);
    index++;
  }
}

interface SelectorEntry {
  selector: IndexedSequenceElementSelector<unknown, unknown>;
  // Reserved for future use.
  flatten?: false;
}

/*
TODO
interface FlattenSelectorEntry {
  selector: SequenceElementSelector<unknown, Iterable<unknown>>;
  flatten: true;
}
*/

interface SelectIteratorState<T> {
  readonly iterable: Iterable<T>;
  selectors: SelectorEntry[];
}

/*
interface SelectManyStackItem {
  selectorIndex: number;
  iterator: Iterator<unknown>;
}
*/

class SelectLinqWrapper<T, TResult>
  extends IntermediateLinqWrapper<TResult, SelectIteratorState<T>>
  implements BuiltInLinqTraits<TResult> {
  public override *[Symbol.iterator](): Iterator<TResult> {
    const { iterable, selectors } = this.__state;
    const indices = new Array<number>(selectors.length).fill(0);
    for (const e of iterable) {
      let projection: unknown = e;
      for (let i = 0; i < selectors.length; i++) {
        projection = selectors[i].selector(projection, indices[i]);
        indices[i]++;
      }
      yield projection as TResult;
    }
  }
  public [TryGetCountDirectSymbol](): number | undefined {
    // projection does not change item count.
    // N.b. This does not hold as soon as we introduce selectMany here.
    return asLinq(this.__state.iterable).$_(tryGetCountDirect());
  }
}
