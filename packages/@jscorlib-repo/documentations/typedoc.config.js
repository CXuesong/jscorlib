import * as path from "node:path";
import * as url from "node:url";
// import tsdocJson from "typedoc/tsdoc.json" with {type: "jsonc"};

const repoRoot = path.resolve(url.fileURLToPath(import.meta.url), "../../../..");

/** @type {import("typedoc").TypeDocOptions} */
export default {
  entryPoints: [
    `${repoRoot}/packages/jscorlib`,
  ],
  out: "dist",

  plugin: [
    "typedoc-plugin-mdn-links",
  ],

  entryPointStrategy: "packages",
  githubPages: true,
  sourceLinkExternal: true,

  packageOptions: {
    includeVersion: true,
    sourceLinkExternal: true,
  },
};
