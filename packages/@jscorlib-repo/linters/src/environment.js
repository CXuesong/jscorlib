import * as path from "node:path";
import * as url from "node:url";

// Make ESLint running in VSCode happy.
// VSCode is on Node 20 right now. import.meta.dirname is not available yet.
export const repoRootDir = path.resolve(url.fileURLToPath(import.meta.url), "../../../../..");
