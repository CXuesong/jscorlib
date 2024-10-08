import { ComparerFunction, compareStringInvariant, getComparer, registerComparer } from "../collections/comparison";
import { fail } from "../diagnostics";
import { InvalidOperationError } from "../errors";
import { ClassTypeId, PrimitiveTypeId, baseClassOf, getTypeId, typeIdToString } from "../types";

/**
 * Sorts the specified array in-place.
 * This function intends to implement stable sort.
 * 
 * @param array the array to get sorted.
 * @param comparer an optional callback used to compare the elements.
 *        `undefined` elements will be passed in to it nevertheless.
 * 
 * @todo Implement this function without `Array.sort` -- it is too tricky and might be slow.
 */
export function sort<T>(array: T[], comparer?: ComparerFunction<T>): void {
  if (array.length < 2) return;
  comparer ??= defaultArrayComparer;
  array.sort(comparer);

  // There is a block of undefined elements at the end of array.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
  if (array[array.length - 1] === undefined) {
    if (array[0] === undefined) return;
    // TODO binary search
    // Locate the block of undefined elements
    const startPos = (() => {
      for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] !== undefined) return i + 1;
      }
      fail();
      return array.length - 1;
    })();
    const itemCount = array.length - startPos;
    const undefinedBlock = array.splice(startPos, itemCount);
    // Determine insertion point
    if (comparer(undefined!, array[0]) < 0) {
      array.unshift(...undefinedBlock);
      return;
    }
    if (comparer(undefined!, array[startPos - 1]) > 0) {
      return;
    }
    fail("Will insert undefined element block in the middle of the Array. Not implemented.");
  }
}

const typeIdOrderMap: Partial<Record<PrimitiveTypeId, number>> = {
  // undefined: 0,
  // null: 1,
  boolean: 2,
  number: 3,
  bigint: 3,
  string: 4,
  object: 4,
};

/**
 * Provides default implementation for sorting JS arrays.
 * 
 * @remarks
 * The implementation sorts the array with the following order
 * * undefined
 * * null
 * * boolean (false, true)
 * * number / bigint
 * * string
 * * object
 * 
 * `object`s of the same type are compared with the comparer function retrieved from {@link getComparer}.
 * Attempting to compare other primitive types, or object types that are yet to be registered (with {@link registerComparer})
 * will cause {@link InvalidOperationError}.
 */
export function defaultArrayComparer(x: unknown, y: unknown): number {
  if (x === undefined) {
    if (y === undefined) return 0;
    return -1;
  }
  if (x === null) {
    if (y === undefined) return 1;
    if (y === null) return 0;
    return -1;
  }
  if (y == null) {
    // x !== undefined / null
    return 1;
  }

  const tx = typeof x;
  const ty = typeof y;
  const ox = typeIdOrderMap[tx];
  if (ox == null) throw new InvalidOperationError(`Comparing value of type ${typeIdToString(tx)} is not supported.`);
  const oy = typeIdOrderMap[ty];
  if (oy == null) throw new InvalidOperationError(`Comparing value of type ${typeIdToString(ty)} is not supported.`);

  if (ox != oy) return ox - oy;

  switch (tx) {
    case "boolean":
      if (!x && y) return -1;
      if (x && !y) return 1;
      // if (x === y)
      return 0;
    case "number":
      if (x > y) return 1;
      if (x < y) return -1;
      // We want to place negative 0 before positive 0.
      if (Object.is(x, 0) && Object.is(y, -0)) return 1;
      if (Object.is(x, -0) && Object.is(y, 0)) return -1;
      return 0;
    case "bigint":
      if (x > y) return 1;
      if (x < y) return -1;
      return 0;
    case "string":
      return compareStringInvariant(x as string, y as string);
    case "object": {
      let xType: ClassTypeId | undefined = getTypeId(x);
      while (xType) {
        const comparer = getComparer(xType);
        if (comparer) {
          // check whether applicable to y
          if (y instanceof xType) {
            return comparer(x, y);
          }
        }
        xType = baseClassOf(xType);
      }
      // No available comparer
      throw new InvalidOperationError(`Comparing values of type ${typeIdToString(getTypeId(x))} and type ${typeIdToString(getTypeId(y))} is not supported.`);
    }
  }

  fail("Should not reach here.");
  throw new InvalidOperationError(`Comparing value of type ${typeIdToString(tx)} is not supported.`);
}
