import { PipeBody } from "../../pipables";
import type { LinqWrapper } from "../linqWrapper";

// TODO global shared instanceof support with Symbol.for
export abstract class AbstractLinqWrapper<T> implements LinqWrapper<T> {
  public $<T>(pipeBody: PipeBody<this, T>): T {
    return pipeBody(this);
  }
  public abstract [Symbol.iterator](): Iterator<T>;
  public unwrap(): Iterable<T> {
    return this;
  }
}

export class IterableLinqWrapper<T> extends AbstractLinqWrapper<T> {
  public constructor(private readonly _iterable: Iterable<T>) {
    super();
  }
  public [Symbol.iterator](): Iterator<T> {
    return this._iterable[Symbol.iterator]();
  }
  public override unwrap(): Iterable<T> {
    return this._iterable;
  }
}

export class IterableFactoryLinqWrapper<T> extends AbstractLinqWrapper<T> {
  public constructor(private readonly _iteratorFactory: () => Iterable<T>) {
    super();
  }
  public *[Symbol.iterator](): Iterator<T> {
    yield* this._iteratorFactory();
  }
}

export abstract class IntermediateLinqWrapper<T, TState> extends AbstractLinqWrapper<T> {
  public constructor(public readonly __state: TState) {
    super();
  }
}
