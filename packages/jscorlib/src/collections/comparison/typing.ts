/**
 * A function that compares two objects.
 * 
 * @remarks An implementation of this method must return
 * * a value less than 0 if x is less than y,
 * * 0 if x is equal to y,
 * * or a value greater than zero if x is greater than y.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComparerFunction<T = any> = (x: T, y: T) => number;
