const vitestIndexPath = await import.meta.resolve("vitest");
const vitestBinPath = new URL("../vitest.mjs", vitestIndexPath);
await import(vitestBinPath);
