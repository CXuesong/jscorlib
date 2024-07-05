import { SafeInteger } from "../numbers";

const objectIdMap = new WeakMap<object, number>();
let nextId = 100;

/**
 * Assigns a unique ID for the specified object, represented by an integer.
 * 
 * @param obj the object to assign the ID.
 * @returns an immutable ID specific for this object. If the object has already been assigned an
 * ID, this function will return the prior assigned ID.
 * @throws {@link !TypeError} `obj` is not an `object`, or `obj` is `null`.
 */
export function getObjectId(obj: object): SafeInteger {
  let id = objectIdMap.get(obj);
  if (id == null) {
    id = nextId;
    objectIdMap.set(obj, id);
    nextId++;
  }
  return id;
}
