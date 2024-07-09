import { SafeInteger } from "../numbers";
import { ReferenceType } from "../types/referenceType";

const objectIdMap = new WeakMap<ReferenceType, number>();
let nextId = 100;

/**
 * Assigns a unique ID for the specified reference type value, represented by an integer.
 * 
 * @param obj the non-null `object`, `array`,
 * or [non-shared `symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#shared_symbols_in_the_global_symbol_registry)
 * to assign the ID.
 * @returns an immutable ID specific for this object. If the object has already been assigned an
 * ID, this function will return the prior assigned ID.
 * @throws {@link !TypeError} `obj` is not an `object` or `array`, or `obj` is `null` or shared `symbol`.
 */
export function getObjectId(obj: ReferenceType): SafeInteger {
  let id = objectIdMap.get(obj);
  if (id == null) {
    id = nextId;
    objectIdMap.set(obj, id);
    nextId++;
  }
  return id;
}
