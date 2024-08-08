import { typeDocOptionsPreset } from "@jscorlib-repo/typedoc-presets";

/** @type {Partial<import('typedoc').TypeDocOptions>} */
export default {
  ...typeDocOptionsPreset,
  entryPoints: [
    "src/index.ts",
  ],
};
