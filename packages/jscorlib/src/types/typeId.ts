// We can only list them one-by-one for now
// https://stackoverflow.com/questions/69654873/

export interface PrimitiveTypeMap {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  symbol: symbol;
  undefined: undefined;
  object: object;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function: (...args: any[]) => any;
}

/**
 * Represents all the possible return values of JS `typeof` operator.
 */
export type PrimitiveType = keyof PrimitiveTypeMap;

/**
 * Represents a partial constructor {@link Function} object that holds a prototype.
 * This also represents the type of corresponding class instances.
 * 
 * @example
 * You can just assign a class definition to this type
 * ```ts
 * const type1: PrototypeHolder = Date;
 * const type2: PrototypeHolder = Blob;
 * 
 * class MyClass {}
 * const type3: PrototypeHolder = MyClass;
 * ```
 */
export interface PrototypeHolder {
  name?: string;
  /** React components */
  displayName?: string;
  prototype: unknown;
  [Symbol.hasInstance]: unknown;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): any;
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
    return prototype.constructor as PrototypeHolder;
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
