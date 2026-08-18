import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  /*
   * The site is served from https://northsideweb.github.io/northsideweb-second-try/,
   * so every generated URL needs that prefix. An absolute base rather than "./"
   * because the bundled example exports are referenced through `asset()` at
   * runtime, and those need a path that resolves the same from any depth.
   *
   * The dev server serves under this prefix too:
   *   http://localhost:5180/northsideweb-second-try/
   */
  base: "/northsideweb-second-try/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: { port: 5180 },
});
