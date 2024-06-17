import type { CustomInspectFunction } from "util";

export const NodeJSInspectCustomSymbol = Symbol.for('nodejs.util.inspect.custom');
export const ChaiInspectSymbol = Symbol.for('chai/inspect');

export interface CustomInspectableObject {
  [NodeJSInspectCustomSymbol]?: CustomInspectFunction;
  [ChaiInspectSymbol]?: (options: unknown) => unknown;
}

export type CustomInspectable<TBase> = TBase & CustomInspectableObject;
