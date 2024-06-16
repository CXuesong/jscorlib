import { ArgumentRangeError } from "../errors";
import { NoMatchIndexNominal } from "./typing";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Returns the index of the first occurrence of a value in an array.
 * @param array the array where the search is perfomed.
 * @param value the value to locate in the array
 * @param startIndex the array index at which to begin the search. If `startIndex` is omitted, the search starts at index 0.
 * @param count the number of elements in the section to search.
 */
export function indexOf<TArray extends readonly any[], TValue>(
  array: TArray,
  value: TValue,
  startIndex?: number,
  count?: number
): TValue extends TArray[number] ? number : NoMatchIndexNominal;
/**
 * Returns the index of the first occurrence of a value in an array.
 * @param array the array where the search is perfomed.
 * @param value the value to locate in the array
 * @param startIndex the array index at which to begin the search. If `startIndex` is omitted, the search starts at index 0.
 * @param count the number of elements in the section to search.
 */
export function indexOf<TArray extends readonly any[]>(
  array: TArray,
  value: TArray[number],
  startIndex?: number,
  count?: number
): number;
export function indexOf(array: readonly unknown[], value: unknown, startIndex?: number, count?: number): number {
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const { length } = array;
  if (startIndex != null && (startIndex < 0 || startIndex > length)) {
    throw ArgumentRangeError.create(2, "startIndex", "Index must be non-negative, and index must be less than or equal to the array length.");
  }

  // Built-in indexOf is faster, but it will skip all the empty slots
  if (value !== undefined && count == null) return array.indexOf(value, startIndex);

  // Oops. Continue resolving params.
  startIndex ??= 0;
  const toIndex = count == null ? length : startIndex + count;
  if (count != null && (count < 0 || toIndex > length)) {
    throw ArgumentRangeError.create(3, "count", "Count must be non-negative, and count must refer to a position inside the array.");
  }

  // 2nd chance of going back to built-in impl
  if (value !== undefined && toIndex === length) return array.indexOf(value, startIndex);

  // OK. Now. Home-made version, with 5x ~ 130x perf penalty.
  for (let i = startIndex; i < toIndex; i++) {
    if (array[i] === value) return i;
  }
  return -1;
}
