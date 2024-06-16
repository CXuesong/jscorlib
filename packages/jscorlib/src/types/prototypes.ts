import { ClassTypeId } from "./typeId";

/**
 * Given the class definition of, find its base class, if possible.
 * @param classType 
 * @returns 
 */
export function baseClassOf(classType: ClassTypeId): ClassTypeId | undefined {
  const p = Object.getPrototypeOf(classType) as ClassTypeId;
  if (p && typeof p === "function") return p;
  return undefined;
}
