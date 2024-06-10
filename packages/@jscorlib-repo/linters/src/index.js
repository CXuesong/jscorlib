import * as path from "node:path";
import * as url from "node:url";

// VSCode is on Node 20 right now. import.meta.dirname is not available.
export const repoRootDir = path.resolve(url.fileURLToPath(import.meta.url), "../../../../..");
