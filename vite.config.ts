import { defineConfig } from "vite";

// GitHub Pages serves the site under /gaffer/. Local dev and preview use the same base
// so Playwright runs against exactly what gets deployed.
export default defineConfig({
  base: "/gaffer/",
  build: { outDir: "dist", sourcemap: true },
});
