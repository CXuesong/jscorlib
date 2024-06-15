// https://stackoverflow.com/questions/69654873/
const _primitiveType = typeof (0 as unknown);

export type PrimitiveType = typeof _primitiveType;

/** Represents a partial {@link Function} object that holds a prototype. */
export interface PrototypeHolder {
  name?: string;
  /** React components */
  displayName?: string;
  prototype: unknown;
  [Symbol.hasInstance]: unknown;
}

/**
 * Represents either a string of JS primitive type,
 * or the (class) constructor function holding the object prototype.
 * 
 * @remarks
 * * `"object"` may indicate the following cases
 *   * `null` values;
 *   * objects without prototypes (i.e., `Object.getPrototypeOf` returns falsy values);
 *   * objects with prototypes that does not have corresponding constructor.
 */
export type TypeId =
  // type code
  | PrimitiveType
  // Prototype
  | PrototypeHolder
  ;

/**
 * Retrieves the {@link TypeId} representing the type of the given value.
 * @param value 
 * @returns 
 */
export function getTypeId(value: unknown): TypeId {
  const typeOf = typeof value;
  if (typeOf === "object") {
    // null
    if (!value) return "object";
    const prototype = Object.getPrototypeOf(value) as unknown;
    // cannot infer information from prototype.
    if (!prototype || typeof prototype !== "object") return "object";
    if (typeof prototype.constructor !== "function") return "object";
    return prototype.constructor;
  }
  return typeOf;
}

export function typeIdToString(typeId: TypeId): string {
  if (typeId === "object") return "[object]";
  if (typeof typeId === "string") return typeId;
  return `[${typeId.displayName ?? typeId.name ?? String(typeId)}]`;
}
