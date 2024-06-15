import { InvalidCastError } from "./invalidCastError";

/**
 * Flattens the {@link AggregateError.errors} contained in the specified {@link AggregateError} and
 * returns a new error instance containing the flattened errors.
 * @param error 
 * @returns 
 */
export function flattenAggregateError(error: AggregateError): AggregateError {
  if (!(error instanceof AggregateError)) throw InvalidCastError.fromValue(error, AggregateError);
  const flattened: unknown[] = [];
  const pending: unknown[] = [error];
  while (pending.length) {
    const current = pending.shift()!;
    if (current instanceof AggregateError) {
      pending.push(...current.errors as unknown[]);
      continue;
    }
    flattened.push(current);
  }
  const e = new AggregateError(flattened, error.message, { cause: error.cause });
  e.stack = error.stack;
  return e;
}
