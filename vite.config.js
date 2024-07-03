import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import * as path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/electron.js",
      },
      preload: {
        input: path.join(process.cwd(), "electron/preload.js"),
      },
    }),
  ],
  server: {
    headers: {
      "Cache-Control": "no-store", // Ensure all resources are revalidated
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Add content hash to filenames to avoid cache issues
        entryFileNames: `[name].[hash].js`,
        chunkFileNames: `[name].[hash].js`,
        assetFileNames: `[name].[hash].[ext]`,
      },
    },
  },
});
