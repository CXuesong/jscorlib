/* eslint-disable @typescript-eslint/no-explicit-any */

// We can only list them one-by-one for now
// https://stackoverflow.com/questions/69654873/
/**
 * An interface listing all the possible return values of JS `typeof` operator,
 * and their corresponding value type.
 */
export interface PrimitiveTypeIdMap {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  symbol: symbol;
  undefined: undefined;
  object: object | null;

  function: (...args: any[]) => any;
}

/**
 * Represents all the possible return values of JS `typeof` operator.
 */
export type PrimitiveTypeId = keyof PrimitiveTypeIdMap;

/**
 * Represents a constructor {@link Function} object that holds a prototype.
 * This also represents the type of corresponding class instances.
 * 
 * @template TInstance the type of the class instance.
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
export interface ClassTypeId<TInstance = any> {
  name?: string;
  /** React components */
  displayName?: string;
  prototype: unknown;
  [Symbol.hasInstance]: unknown;


  new(...args: any[]): TInstance;
}

/**
 * Represents either a string of JS primitive type,
 * or the (class) constructor function holding the object prototype.
 * 
 * @remarks
 * `"object"` may indicate the following cases
 * * `null` values;
 * * objects without prototypes (i.e., `Object.getPrototypeOf` returns falsy values);
 * * objects with prototypes that does not have corresponding constructor.
 * 
 * For all the other cases, a more specific class reference ({@link ClassTypeId})
 * is used to represent an object type.
 */
export type TypeId =
  // type code
  | PrimitiveTypeId
  // objects with prototype
  | ClassTypeId
  ;

/**
 * A type helper that converts the {@link TypeId} into corresponding value types.
 * 
 * @remarks
 * This is the reverse operation of {@link TypeIdOf}.
 * 
 * @example
 * ```ts
 * type T1 = TypeFromTypeId<"string">;      // --> T1 = string
 * type T2 = TypeFromTypeId<"boolean">;     // --> T2 = boolean
 * type T3 = TypeFromTypeId<"string" | "number">;     // --> T3 = string | number
 * // Note that to indicate a variable that contains the type of the class itself,
 * // use `typeof ClassName` instead of `ClassName`.
 * type T4 = TypeFromTypeId<typeof Element>;          // --> T4 = Element
 * type T5 = TypeFromTypeId<"string" | typeof Date>;  // --> T5 = string | Date
 * ```
 */
export type TypeFromTypeId<T extends TypeId> =
  | (T extends keyof PrimitiveTypeIdMap ? PrimitiveTypeIdMap[T] : never)
  | (T extends ClassTypeId ? InstanceType<T> : never)
  ;

/**
 * A type helper that converts the value type into corresponding {@link TypeId}.
 * 
 * @remarks
 * This is the reverse operation of {@link TypeFromTypeId}.
 */
export type TypeIdOf<TValue> =
  // For now, we need to list this out, one by one.
  // https://github.com/microsoft/TypeScript/issues/48992
  /* eslint-disable @stylistic/indent */
  | TValue extends string ? "string"
  : TValue extends number ? "number"
  : TValue extends bigint ? "bigint"
  : TValue extends boolean ? "boolean"
  : TValue extends symbol ? "symbol"
  : TValue extends undefined ? "undefined"

  : TValue extends (...args: any[]) => any ? "undefined"
  : TValue extends null ? "object"
  : TValue extends object ? ClassTypeId<TValue>
  // Not inferrable until runtime
  : TypeId
  /* eslint-enable @stylistic/indent */
  ;
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Retrieves the {@link TypeId} representing the type of the given value.
 * @param value 
 * @returns 
 */
export function getTypeId<TValue>(value: TValue): TypeIdOf<TValue>;
export function getTypeId(value: unknown): TypeId;
export function getTypeId(value: unknown): TypeId {
  const typeOf = typeof value;
  if (typeOf === "object") {
    // null
    if (!value) return "object";
    const prototype = Object.getPrototypeOf(value) as unknown;
    // cannot infer information from prototype.
    if (typeof prototype?.constructor !== "function") return "object";
    return prototype.constructor as ClassTypeId;
  }
  return typeOf;
}

export function typeIdToString(typeId: TypeId): string {
  if (typeId === "object") return "[object]";
  if (typeof typeId === "string") return typeId;
  return `[${typeId.displayName ?? typeId.name ?? String(typeId)}]`;
}

export function isAssignableToTypeId(value: unknown, typeId: TypeId): value is TypeFromTypeId<TypeId> {
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
