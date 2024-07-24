import { InstallPolyfillOptions } from "../polyfill-installer";
import { DisposableStack } from "./disposableStack";

export function installPolyfill(options: InstallPolyfillOptions): void {
  const { globalThis: global = globalThis } = options;
  (global.Symbol.dispose as symbol) ??= Symbol("jscorlib::Symbol.dispose");
  (global.Symbol.asyncDispose as symbol) ??= Symbol("jscorlib::Symbol.asyncDispose");
  global.DisposableStack ??= DisposableStack;
}
