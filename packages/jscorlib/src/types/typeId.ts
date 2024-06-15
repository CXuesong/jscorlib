// We can only list them one-by-one for now
// https://stackoverflow.com/questions/69654873/

/**
 * Represents all the possible return values of JS `typeof` operator.
 */
export type PrimitiveType =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function"
  ;

/** Represents a partial {@link Function} object that holds a prototype. */
export interface PrototypeHolder {
  name?: string;
  /** React components */
  displayName?: string;
  prototype: unknown;
  [Symbol.hasInstance]: unknown;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): any;
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
    if (typeof prototype?.constructor !== "function") return "object";
    return prototype.constructor as (...args: unknown[]) => unknown;
  }
  return typeOf;
}

export function typeIdToString(typeId: TypeId): string {
  if (typeId === "object") return "[object]";
  if (typeof typeId === "string") return typeId;
  return `[${typeId.displayName ?? typeId.name ?? String(typeId)}]`;
}

export function isAssignableToTypeId(value: unknown, typeId: TypeId): boolean {
  if (value === null) return typeId === "object";
  if (value === undefined) return typeId === "undefined";
  if (value === true || value === false) return typeId === "boolean";
  const valueTypeOf = typeof value;
  // Primitive type name match
  if (valueTypeOf === typeId) return true;
  // Object prototype chain check (instanceof)
  if (valueTypeOf === "object") {
    if (typeof typeId === "function") {
      return value instanceof typeId;
    }
    return false;
  }
  // No match
  return false;
}
