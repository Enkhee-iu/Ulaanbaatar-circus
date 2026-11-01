// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
// Import the package's ESM entry directly; its CommonJS main entry references
// `module.exports`, which is unavailable in Vite's ESM config runner.
import { defineConfig } from "@lovable.dev/vite-tanstack-config/dist/index.js";

export default defineConfig({
  nitro: process.env.UB_CIRCUS_LOCAL_BUILD === "1" ? { preset: "node-server" } : undefined,
  vite: {
    server: {
      proxy: {
        "/api": process.env.UB_CIRCUS_API_URL || "http://127.0.0.1:8787",
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
