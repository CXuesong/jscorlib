import { defaultArrayComparer, sort } from "../../arrays";
import { ComparerFunction } from "../comparison";
import { asLinq, LinqWrapper } from "./linqWrapper";
import { IntermediateLinqWrapper } from "./linqWrapper.internal";
import { BuiltInLinqTraits, TryGetCountDirectSymbol } from "./traits";
import { SequenceElementSimpleSelector } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    orderBy<TKey>(keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey>): OrderedLinqWrapper<T>;
    orderByDescending<TKey>(keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey>): OrderedLinqWrapper<T>;
  }
}

export interface OrderedLinqWrapperBase<T> {
  thenBy<TKey>(keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey>): LinqWrapper<T>;
  thenByDescending<TKey>(keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey>): LinqWrapper<T>;
}

export interface OrderedLinqWrapper<T> extends LinqWrapper<T>, OrderedLinqWrapperBase<T> {
}

export function Linq$orderBy<T, TKey>(this: LinqWrapper<T>, keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey>): OrderedLinqWrapper<T> {
  return resetOrderClause(this, { selector: keySelector, comparer, descending: false });
}

export function Linq$orderByDescending<T, TKey>(this: LinqWrapper<T>, keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey>): OrderedLinqWrapper<T> {
  return resetOrderClause(this, { selector: keySelector, comparer, descending: true });
}

function resetOrderClause<T, TKey>(wrapper: LinqWrapper<T>, clause: OrderClause<T, TKey>): OrderedLinqWrapper<T> {
  const unwrapped = wrapper instanceof OrderedLinqWrapperImpl
    // Discard old sorting
    ? wrapper.__state.iterable
    : wrapper.unwrap();
  return new OrderedLinqWrapperImpl({
    iterable: unwrapped as Iterable<T>,
    orderClauses: [clause],
  }).asLinq();
}

function Linq$appendOrderClause<T, TKey>(wrapper: OrderedLinqWrapperImpl<T>, clause: OrderClause<T, TKey>): OrderedLinqWrapper<T> {
  const state = wrapper.__state;
  return new OrderedLinqWrapperImpl<T>({
    ...state,
    orderClauses: [...state.orderClauses, clause],
  }).asLinq();
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
  implements OrderedLinqWrapperBase<T>, BuiltInLinqTraits {
  public override asLinq(): OrderedLinqWrapper<T> {
    return this as unknown as OrderedLinqWrapper<T>;
  }
  public thenBy<TKey>(keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey> | undefined): LinqWrapper<T> {
    return Linq$appendOrderClause(this, { selector: keySelector, comparer, descending: false });
  }
  public thenByDescending<TKey>(keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: ComparerFunction<TKey> | undefined): LinqWrapper<T> {
    return Linq$appendOrderClause(this, { selector: keySelector, comparer, descending: true });
  }
  public override[TryGetCountDirectSymbol](): number | undefined {
    return asLinq(this.__state.iterable).tryGetCountDirect();
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
      const { selector, comparer, descending } = orderClauses[orderClauses.length - i - 1];
      const signFactor = descending ? -1 : 1;
      if (selector) {
        // fill keys
        for (let i = 0; i < buffer.length; i++) buffer[i][1] = selector(buffer[i][0]);
        if (comparer)
          sort(buffer, (x, y) => signFactor * comparer(x[1], y[1]));
        else
          sort(buffer, (x, y) => signFactor * defaultArrayComparer(x[1], y[1]));
      } else {
        // compare by elements
        if (comparer)
          sort(buffer, (x, y) => signFactor * comparer(x[0], y[0]));
        else
          sort(buffer, (x, y) => signFactor * defaultArrayComparer(x[0], y[0]));
      }
    }
    for (let i = 0; i < buffer.length; i++) yield buffer[i][0];
    /* eslint-enable @typescript-eslint/prefer-for-of */
  }
}
