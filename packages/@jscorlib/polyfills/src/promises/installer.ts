import { InstallPolyfillOptions } from "../polyfill-installer";
import { withResolvers } from "./withResolvers";

export function installPolyfill(options: InstallPolyfillOptions): void {
  const { globalThis: global = globalThis } = options;
  global.Promise.withResolvers ??= withResolvers;
}
