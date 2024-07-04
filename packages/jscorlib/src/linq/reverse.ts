import { asLinq, LinqWrapper } from "./linqWrapper";
import { IntermediateLinqWrapper } from "./linqWrapper.internal";
import { BuiltInLinqTraits, TryGetCountDirectSymbol, TryUnwrapUnorderedSymbol } from "./traits";
import { isArrayLikeStrict } from "./utils.internal";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    reverse(): LinqWrapper<T>;
  }
}

export function Linq$reverse<T>(this: LinqWrapper<T>): LinqWrapper<T> {
  if (this instanceof ReverseLinqWrapper) {
    const state = this.__state;
    // Reverse + Reverse --> Original
    return asLinq(this.__state.iterable);
  }

  return new ReverseLinqWrapper({
    iterable: this.unwrap(),
  }).asLinq();
}

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
    return asLinq(this.__state.iterable).tryGetCountDirect();
  }
  public override[TryUnwrapUnorderedSymbol](): Iterable<T> {
    return this.__state.iterable;
  }
}
