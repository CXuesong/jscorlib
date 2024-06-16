/**
 * A function that compares two objects.
 * 
 * @remarks An implementation of this method must return
 * * a value less than 0 if x is less than y,
 * * 0 if x is equal to y,
 * * or a value greater than zero if x is greater than y.
 */
export type ComparerFunction<T = unknown> = (x: T, y: T) => number;
