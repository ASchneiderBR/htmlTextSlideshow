import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "chrome103",
    rollupOptions: {
      input: {
        DevLab: path.resolve(rootDir, "src/devlab/index.html"),
        Dock: path.resolve(rootDir, "src/dock/index.html"),
        Source: path.resolve(rootDir, "src/source/index.html")
      }
    }
  }
});
