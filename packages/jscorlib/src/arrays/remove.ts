import { ArgumentRangeError } from "../errors";
import { indexOf } from "./indexOf";
import { BidirectionalIndex } from "./typing";

/**
 * Removes an element by index from an array.
 * @param array array to remove the element from.
 * @param index index of the array element to be removed.
 * @returns `true` if the index is within the indexable range of `array`, and thus the item has been removed;
 *          `false` otherwise.
 * @template T type of the array element. The type parameter is intentionally declared as such to avoid
 *            handling tuples. While it is possible to remove item from tuple, it will impact typing
 *            soundness.
 */
export function removeAt<T>(array: T[], index: BidirectionalIndex): boolean {
  if (index < 0) index += array.length;
  if (index >= array.length) return false;
  array.splice(index, 1);
  return true;
}

/**
 * Removes an element by index from an array.
 * @param array array to remove the element from.
 * @param fromIndex start index of the array elements to be removed.
 * @param count count of the array elements to be removed.
 * @template T type of the array element. The type parameter is intentionally declared as such to avoid
 *            handling tuples. While it is possible to remove item from tuple, it will impact typing
 *            soundness.
 */
export function removeRange<T>(array: T[], fromIndex: BidirectionalIndex, count: number): void {
  if (fromIndex < 0) fromIndex += array.length;

  if (fromIndex > array.length) 
    throw ArgumentRangeError.create(1, "startIndex", "Index must be non-negative, and index must be less than or equal to the array length.");
  if (count < 0 || fromIndex + count > array.length)
    throw ArgumentRangeError.create(2, "count", "Count must be non-negative, and count must refer to a position inside the array.");

  array.splice(fromIndex, count);
}

/**
 * Removes the first matching element from an array.
 * @param array array to remove the element from.
 * @param item value of the array element to be removed.
 * @returns `true` if the item is found in `array`, and thus the item has been removed;
 *          `false` otherwise.
 * @template T type of the array element. The type parameter is intentionally declared as such to avoid
 *            handling tuples. While it is possible to remove item from tuple, it will impact typing
 *            soundness.
 */
export function remove<T, TItem>(array: T[], item: TItem): TItem extends T ? boolean : false;
export function remove<T>(array: T[], item: T): boolean;
export function remove<T>(array: T[], item: unknown): boolean {
  const index = indexOf(array, item);
  if (index < 0) return false;
  array.splice(index, 1);
  return true;
}
