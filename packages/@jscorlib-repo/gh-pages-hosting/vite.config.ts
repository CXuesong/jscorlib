import { defineConfig } from "vite";
import { checker } from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths({ loose: true }),
    checker({
      typescript: {
        tsconfigPath: "./src/tsconfig.json",
      },
    }),
    svelte(),
  ],
});
