import { AsyncLazyLike, LazyLike } from "./typing";

export function createResolvedLazyLike<T>(value: T): LazyLike<T> {
  return Object.freeze({
    value,
    valueCreated: true,
  });
}

export function createResolvedAsyncLazyLike<T>(value: T): AsyncLazyLike<T> {
  return Object.freeze({
    value: Promise.resolve(value),
    valueCreated: true,
    tryGetImmediateValue: () => value,
  });
}
