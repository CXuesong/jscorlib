import { InstallPolyfillOptions } from "../polyfill-installer";
import { withResolvers } from "./withResolvers";

export function installPolyfill(options: InstallPolyfillOptions): void {
  const { globalThis: global = globalThis } = options;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  global.Promise.withResolvers ??= withResolvers;
}
