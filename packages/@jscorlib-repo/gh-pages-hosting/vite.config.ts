import { defineConfig } from "vite";
import { checker } from "vite-plugin-checker";
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    checker({
      typescript: {
        tsconfigPath: "./src/tsconfig.json",
      },
    }),
    svelte(),
  ],
  base: "./",
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
});
