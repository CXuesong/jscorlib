import { PipeBody } from "../../pipables";
import { IntermediateLinqWrapper } from "../internal";
import { asLinq, LinqWrapper } from "../linqWrapper";
import { BuiltInLinqTraits, TryGetCountDirectSymbol } from "../traits";
import { tryGetCountDirect } from "./count";

export function concat<T, TAnother>(another: Iterable<TAnother>): PipeBody<LinqWrapper<T>, LinqWrapper<T | TAnother>> {
  return target => {
    if (target instanceof ConcatLinqWrapper) {
      const state = target.__state;
      return new ConcatLinqWrapper<T, TAnother>({
        iterables: [...state.iterables, another],
      });
    }
    return new ConcatLinqWrapper<T, TAnother>({
      iterables: [target, another],
    });
  };
}

interface ConcatLinqWrapperState<T> {
  readonly iterables: ReadonlyArray<Iterable<T>>;
}

class ConcatLinqWrapper<T, TAnother>
  extends IntermediateLinqWrapper<T | TAnother, ConcatLinqWrapperState<T | TAnother>>
  implements BuiltInLinqTraits<T | TAnother> {
  public override *[Symbol.iterator](): Iterator<T | TAnother> {
    const { iterables } = this.__state;
    for (const it of iterables) {
      for (const e of it) {
        yield e;
      }
    }
  }
  public [TryGetCountDirectSymbol](): number | undefined {
    const { iterables } = this.__state;
    let count = 0;
    for (const it of iterables) {
      const itCount = asLinq(it).$(tryGetCountDirect());
      if (itCount == null) return undefined;
      count += itCount;
    }
    return count;
  }
}
