import { defaultArrayComparer, sort } from "../../arrays";
import { ComparerFunction } from "../../collections/comparison";
import { PipeBody, PipeFunction } from "../../pipables";
import { tryGetCountDirect } from "./count";
import { asLinq, LinqWrapper } from "../linqWrapper";
import { IntermediateLinqWrapper } from "../internal";
import { BuiltInLinqTraits, TryGetCountDirectSymbol, TryUnwrapUnorderedSymbol } from "../traits";
import { SequenceElementSelector } from "./typing";
import { unwrapUnorderedLinqWrapper } from "../internal";

export interface OrderedLinqWrapperBase<T> {
  thenBy<TKey>(keySelector: SequenceElementSelector<T, TKey>, comparer?: ComparerFunction<TKey>): LinqWrapper<T>;
  thenByDescending<TKey>(keySelector: SequenceElementSelector<T, TKey>, comparer?: ComparerFunction<TKey>): LinqWrapper<T>;
}

export interface OrderedLinqWrapper<T> extends LinqWrapper<T>, OrderedLinqWrapperBase<T> {
}

export function orderBy<T, TKey>(keySelector: SequenceElementSelector<T, TKey>, comparer?: ComparerFunction<TKey>): PipeBody<LinqWrapper<T>, OrderedLinqWrapper<T>> {
  return target => resetOrderClause(target, { selector: keySelector, comparer, descending: false });
}
orderBy satisfies PipeFunction;

export function orderByDescending<T, TKey>(keySelector: SequenceElementSelector<T, TKey>, comparer?: ComparerFunction<TKey>): PipeBody<LinqWrapper<T>, OrderedLinqWrapper<T>> {
  return target => resetOrderClause(target, { selector: keySelector, comparer, descending: true });
}
orderByDescending satisfies PipeFunction;

export function order<T, TKey>(comparer?: ComparerFunction<TKey>): PipeBody<LinqWrapper<T>, OrderedLinqWrapper<T>> {
  return target => resetOrderClause(target, { comparer, descending: false });
}
order satisfies PipeFunction;

export function orderDescending<T, TKey>(comparer?: ComparerFunction<TKey>): PipeBody<LinqWrapper<T>, OrderedLinqWrapper<T>> {
  return target => resetOrderClause(target, { comparer, descending: true });
}
orderDescending satisfies PipeFunction;

function resetOrderClause<T, TKey>(wrapper: LinqWrapper<T>, clause: OrderClause<T, TKey>): OrderedLinqWrapper<T> {
  const unwrapped = wrapper instanceof OrderedLinqWrapperImpl
    // Discard old sorting
    ? wrapper.__state.iterable
    : unwrapUnorderedLinqWrapper(wrapper);
  return new OrderedLinqWrapperImpl({
    iterable: unwrapped as Iterable<T>,
    orderClauses: [clause],
  });
}

function appendOrderClause<T, TKey>(wrapper: OrderedLinqWrapperImpl<T>, clause: OrderClause<T, TKey>): OrderedLinqWrapper<T> {
  const state = wrapper.__state;
  return new OrderedLinqWrapperImpl<T>({
    ...state,
    orderClauses: [...state.orderClauses, clause],
  });
}

interface OrderClause<T, TKey = T> {
  selector?: (element: T) => TKey;
  comparer?: ComparerFunction<TKey>;
  descending: boolean;
}

interface OrderedIteratorInfo<T> {
  iterable: Iterable<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderClauses: Array<OrderClause<T, any>>;
}

class OrderedLinqWrapperImpl<T>
  extends IntermediateLinqWrapper<T, OrderedIteratorInfo<T>>
  implements OrderedLinqWrapperBase<T>, BuiltInLinqTraits<T> {
  public thenBy<TKey>(keySelector: SequenceElementSelector<T, TKey>, comparer?: ComparerFunction<TKey> | undefined): LinqWrapper<T> {
    return appendOrderClause(this, { selector: keySelector, comparer, descending: false });
  }
  public thenByDescending<TKey>(keySelector: SequenceElementSelector<T, TKey>, comparer?: ComparerFunction<TKey> | undefined): LinqWrapper<T> {
    return appendOrderClause(this, { selector: keySelector, comparer, descending: true });
  }
  public override[TryGetCountDirectSymbol](): number | undefined {
    return asLinq(this.__state.iterable).$(tryGetCountDirect());
  }
  public override[TryUnwrapUnorderedSymbol](): Iterable<T> {
    return this.__state.iterable;
  }
  public override *[Symbol.iterator](): Iterator<T> {
    const { iterable, orderClauses } = this.__state;
    // TODO calculate sorted indicies instead.
    const buffer: Array<[value: T, key: unknown]> = [];
    for (const e of iterable) {
      buffer.push([e, undefined]);
    }
    // perf consideration
    /* eslint-disable @typescript-eslint/prefer-for-of */
    for (let i = 0; i < orderClauses.length; i++) {
      // stable sort but reverse the order of clauses
      const { selector, comparer = defaultArrayComparer, descending } = orderClauses[orderClauses.length - i - 1];
      const signFactor = descending ? -1 : 1;
      if (selector) {
        // fill keys
        for (let i = 0; i < buffer.length; i++) buffer[i][1] = selector(buffer[i][0]);
        sort(buffer, (x, y) => signFactor * comparer(x[1], y[1]));
      } else {
        // compare by elements
        sort(buffer, (x, y) => signFactor * comparer(x[0], y[0]));
      }
    }
    for (let i = 0; i < buffer.length; i++) yield buffer[i][0];
    /* eslint-enable @typescript-eslint/prefer-for-of */
  }
}
