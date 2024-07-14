import { BidirectionalIndex } from "../arrays";
import { assert } from "../diagnostics";
import { ArgumentRangeError, InvalidOperationError } from "../errors";
import { asSafeInteger } from "../numbers/asSafeInteger";
import type { LinqWrapper } from "./linqWrapper";
import { IndexedSequenceElementPredicate } from "./typing";
import { isArrayLikeStrict } from "./utils.internal";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    first(): T;
    first(predicate?: IndexedSequenceElementPredicate<T>): T;
    last(): T;
    last(predicate?: IndexedSequenceElementPredicate<T>): T;
    firstOrDefault(): T | undefined;
    firstOrDefault(predicate: IndexedSequenceElementPredicate<T> | undefined, defaultValue: T): T;
    firstOrDefault(predicate?: IndexedSequenceElementPredicate<T>, defaultValue?: T): T | undefined;
    lastOrDefault(): T | undefined;
    lastOrDefault(predicate: IndexedSequenceElementPredicate<T> | undefined, defaultValue: T): T;
    lastOrDefault(predicate?: IndexedSequenceElementPredicate<T>, defaultValue?: T): T | undefined;
    elementAt(index: BidirectionalIndex): T;
    elementAtOrDefault(index: BidirectionalIndex): T;
    elementAtOrDefault(index: BidirectionalIndex, defaultValue: T): T;
    elementAtOrDefault(index: BidirectionalIndex, defaultValue?: T): T | undefined;
  }
}

const NoMatch = Symbol("NoMatch");

export function Linq$first<T>(this: LinqWrapper<T>, predicate?: IndexedSequenceElementPredicate<T>): T {
  const e = getFirst(this.unwrap(), predicate);
  if (e !== NoMatch) return e;

  if (predicate) throw new InvalidOperationError("Sequence contains no matching element.");
  throw new InvalidOperationError("Sequence contains no element.");
}

export function Linq$last<T>(this: LinqWrapper<T>, predicate?: IndexedSequenceElementPredicate<T>): T {
  const e = getLast(this.unwrap(), predicate);
  if (e !== NoMatch) return e;

  if (predicate) throw new InvalidOperationError("Sequence contains no matching element.");
  throw new InvalidOperationError("Sequence contains no element.");
}

export function Linq$firstOrDefault<T>(this: LinqWrapper<T>, predicate?: IndexedSequenceElementPredicate<T>, defaultValue?: T): T | undefined {
  const e = getFirst(this.unwrap(), predicate);
  if (e !== NoMatch) return e;
  return defaultValue;
}

export function Linq$lastOrDefault<T>(this: LinqWrapper<T>, predicate?: IndexedSequenceElementPredicate<T>, defaultValue?: T): T | undefined {
  const e = getLast(this.unwrap(), predicate);
  if (e !== NoMatch) return e;
  return defaultValue;
}

export function Linq$elementAt<T>(this: LinqWrapper<T>, index: BidirectionalIndex): T | undefined {
  const e = getElementAt(this.unwrap(), index);
  if (e !== NoMatch) return e;
  throw ArgumentRangeError.create(0, "index", "Index is out of range.");
}

export function Linq$elementAtOrDefault<T>(this: LinqWrapper<T>, index: BidirectionalIndex, defaultValue?: T): T | undefined {
  const e = getElementAt(this.unwrap(), index);
  if (e !== NoMatch) return e;
  return defaultValue;
}

function getFirst<T>(iterable: Iterable<T>, predicate?: IndexedSequenceElementPredicate<T>): T | typeof NoMatch {
  if (predicate) {
    let index = 0;
    for (const i of iterable) {
      if (predicate(i, index)) {
        return i;
      }
      index++;
    }
    return NoMatch;
  }

  return getElementAt(iterable, 0);
}

function getLast<T>(iterable: Iterable<T>, predicate?: IndexedSequenceElementPredicate<T>): T | typeof NoMatch {
  if (predicate) {
    if (isArrayLikeStrict(iterable)) {
      const length = iterable.length;
      for (let i = 1; i <= length; i++) {
        if (predicate(iterable[length - i], length - i)) {
          return iterable[length - i];
        }
      }
      return NoMatch;
    }
    let i = 0;
    let lastMatch: T | typeof NoMatch = NoMatch;
    for (const e of iterable) {
      i++;
      if (predicate(e, i)) lastMatch = e;
    }
    return lastMatch;
  }

  return getElementAt(iterable, -1);
}

function getElementAt<T>(iterable: Iterable<T>, index: BidirectionalIndex): T | typeof NoMatch {
  if (isArrayLikeStrict(iterable)) {
    if (index < 0) index += iterable.length;
    if (index < 0 || index >= iterable.length) return NoMatch;
    return iterable[index];
  }

  index = asSafeInteger(index);
  if (index >= 0) {
    // From the beginning
    let i = 0;
    for (const e of iterable) {
      if (i === index) return e;
      i++;
    }
    return NoMatch;
  }
  // From the end
  return elementFromEnd(iterable, -index);
}

function elementFromEnd<T>(iterable: Iterable<T>, indexFromEnd: number): T | typeof NoMatch {
  // indexFromEnd: 1 --> Last one
  assert(indexFromEnd > 0);
  const itemQueue: T[] = [];
  for (const e of iterable) {
    itemQueue.push(e);
    if (itemQueue.length > indexFromEnd) itemQueue.shift();
  }
  assert(itemQueue.length <= indexFromEnd);
  if (itemQueue.length < indexFromEnd) return NoMatch;
  return itemQueue[0];
}
