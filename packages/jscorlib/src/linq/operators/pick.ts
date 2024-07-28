import { BidirectionalIndex } from "../../arrays";
import { assert } from "../../diagnostics";
import { ArgumentRangeError, InvalidOperationError } from "../../errors";
import { asSafeInteger } from "../../numbers/asSafeInteger";
import { PipeBody, PipeFunction } from "../../pipables";
import { isArrayLikeStrict } from "../../types/internal";
import type { LinqWrapper } from "../linqWrapper";
import { IndexedSequenceElementPredicate } from "./typing";

const NoMatch = Symbol("NoMatch");

export function first<T>(predicate?: IndexedSequenceElementPredicate<T>): PipeBody<LinqWrapper<T>, T> {
  return target => {
    const e = getFirst(target.unwrap(), predicate);
    if (e !== NoMatch) return e;
    if (predicate) throw new InvalidOperationError("Sequence contains no matching element.");
    throw new InvalidOperationError("Sequence contains no element.");
  };
}
first satisfies PipeFunction;

export function last<T>(predicate?: IndexedSequenceElementPredicate<T>): PipeBody<LinqWrapper<T>, T> {
  return target => {
    const e = getLast(target.unwrap(), predicate);
    if (e !== NoMatch) return e;
    if (predicate) throw new InvalidOperationError("Sequence contains no matching element.");
    throw new InvalidOperationError("Sequence contains no element.");
  };
}
last satisfies PipeFunction;

export function firstOrDefault<T>(predicate?: IndexedSequenceElementPredicate<T>, defaultValue?: T): PipeBody<LinqWrapper<T>, T | undefined> {
  return target => {
    const e = getFirst(target.unwrap(), predicate);
    if (e !== NoMatch) return e;
    return defaultValue;
  };
}
firstOrDefault satisfies PipeFunction;

export function lastOrDefault<T>(predicate?: IndexedSequenceElementPredicate<T>, defaultValue?: T): PipeBody<LinqWrapper<T>, T | undefined> {
  return target => {
    const e = getLast(target.unwrap(), predicate);
    if (e !== NoMatch) return e;
    return defaultValue;
  };
}
lastOrDefault satisfies PipeFunction;

export function elementAt<T>(index: BidirectionalIndex): PipeBody<LinqWrapper<T>, T | undefined> {
  return target => {
    const e = getElementAt(target.unwrap(), index);
    if (e !== NoMatch) return e;
    throw ArgumentRangeError.create(0, "index", "Index is out of range.");
  };
}
elementAt satisfies PipeFunction;

export function elementAtOrDefault<T>(index: BidirectionalIndex, defaultValue?: T): PipeBody<LinqWrapper<T>, T | undefined> {
  return target => {
    const e = getElementAt(target.unwrap(), index);
    if (e !== NoMatch) return e;
    return defaultValue;
  };
}
elementAtOrDefault satisfies PipeFunction;

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
