import { Application, CommentDisplayPart, DeclarationReference, ExternalResolveResult, Reflection, ReflectionSymbolId } from "typedoc";
import { knownModules, knownNamespaces, symbolLinks } from "./symbolData.js";

export function load(app: Application) {
  app.converter.addUnknownSymbolResolver(resolveSymbol);

  function resolveSymbol(ref: DeclarationReference, _refl: Reflection, _part?: Readonly<CommentDisplayPart>, _symbolId?: ReflectionSymbolId): ExternalResolveResult | string | undefined {
    if (!ref.symbolReference?.path) return undefined;
    if (
      // Via TS symbols
      ref.moduleSource && knownModules.has(ref.moduleSource)
      // Via @link tag
      || !ref.moduleSource && ref.resolutionStart === "global" && knownNamespaces.has(ref.symbolReference.path[0]?.path)
    ) {
      const segments = [...ref.symbolReference.path];
      if (segments[0].path === "__global") segments.shift();
      let path = segments.map(s => s.navigation + s.path).join("");
      if (path.startsWith(".")) path = path.substring(1);

      const target = symbolLinks[path];
      return target ? { target, caption: path } : undefined;
    }
    return undefined;
  }
}
