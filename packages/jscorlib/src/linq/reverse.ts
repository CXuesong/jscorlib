import { PipeBody, PipeFunction } from "../pipables";
import { isArrayLikeStrict } from "../types/internal";
import { tryGetCountDirect } from "./count";
import { asLinq, LinqWrapper } from "./linqWrapper";
import { IntermediateLinqWrapper } from "./linqWrapper.internal";
import { BuiltInLinqTraits, TryGetCountDirectSymbol, TryUnwrapUnorderedSymbol } from "./traits";

export function reverse<T>(): PipeBody<LinqWrapper<T>, LinqWrapper<T>> {
  return target => {
    if (target instanceof ReverseLinqWrapper) {
      // Reverse + Reverse --> Original
      return asLinq(target.__state.iterable as Iterable<T>);
    }

    return new ReverseLinqWrapper({
      iterable: target.unwrap(),
    }).asLinq();
  };
}
reverse satisfies PipeFunction;

interface ReverseIteratorState<T> {
  readonly iterable: Iterable<T>;
}

class ReverseLinqWrapper<T>
  extends IntermediateLinqWrapper<T, ReverseIteratorState<T>>
  implements BuiltInLinqTraits<T> {
  public override *[Symbol.iterator](): Iterator<T> {
    const { iterable } = this.__state;
    const array = isArrayLikeStrict(iterable) ? iterable : [...iterable];
    for (let i = array.length - 1; i >= 0; i--) {
      yield array[i];
    }
  }
  public override[TryGetCountDirectSymbol](): number | undefined {
    return asLinq(this.__state.iterable).$(tryGetCountDirect());
  }
  public override[TryUnwrapUnorderedSymbol](): Iterable<T> {
    return this.__state.iterable;
  }
}
