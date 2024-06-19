import type { CustomInspectFunction } from "util";

/**
 * Synonym of `util.inspect.custom`.
 * 
 * @remarks
 * > Using this allows code to be written in a portable fashion,
 * > so that the custom inspect function is used in an Node.js environment and ignored in the browser
 * @see [util.inspect.custom](https://nodejs.org/api/util.html#utilinspectcustom)
 */
export const NodeJSInspectCustomSymbol = Symbol.for("nodejs.util.inspect.custom");

/**
 * @see [chaijs/loupe - src/index.ts#L29](https://github.com/chaijs/loupe/blob/e02467ef36257859ed29a35f672bafe24df97c66/src/index.ts#L29)
 */
export const ChaiInspectSymbol = Symbol.for("chai/inspect");

/**
 * Provides methods on objects to customize how the
 * objects are rendered in various inspectors.
 * 
 * Please refer to the documentation of respective member for details.
 */
export interface CustomInspectableObject {
  /**
   * Objects may also define their own `[util.inspect.custom](depth, opts, inspect)` function,
   * which util.inspect() will invoke and use the result of when inspecting the object.
   * 
   * @see [util#Custom inspection functions on objects](https://nodejs.org/api/util.html#custom-inspection-functions-on-objects)
   */
  [NodeJSInspectCustomSymbol]?: CustomInspectFunction;
  /**
   * Customizes how the current object is rendered when inspected with `loupe` package.
   * 
   * @param options See [chaijs/loupe - src/types.ts](https://github.com/chaijs/loupe/blob/e02467ef36257859ed29a35f672bafe24df97c66/src/types.ts#L3-L15)
   * for details on the type definition.
   * @returns a string as the representation of current object, or other values that will be rendered again by loupe.
   * @see [chaijs/loupe - src/index.ts#L99](https://github.com/chaijs/loupe/blob/e02467ef36257859ed29a35f672bafe24df97c66/src/index.ts#L99)
   */
  [ChaiInspectSymbol]?: (options: unknown) => unknown;
}

/**
 * Type helper to expose custom inspect function members on the specified object type.
 */
export type CustomInspectable<TBase> = TBase & CustomInspectableObject;
