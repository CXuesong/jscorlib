import * as path from "node:path";

// Make ESLint running in VSCode happy.
// import.meta.dirname is available on Node 24.
export const repoRootDir = path.resolve(import.meta.dirname, "../../../..");
