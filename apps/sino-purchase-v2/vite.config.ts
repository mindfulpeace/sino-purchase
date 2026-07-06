import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  base: "/",
  plugins: [react()],
  // Keep Vite's dep-optimization cache outside the project tree so it never
  // sweeps stale .d.ts.map files out of packages/*/dist (trips the safe-delete guard).
  cacheDir: "/tmp/sino-purchase-vite-cache",
  // Workspace packages (@sino-purchase/*) are consumed from their own dist/ as
  // ESM and must NOT be pre-bundled/optimized by Vite — otherwise Vite sweeps
  // stale .d.ts.map files out of dist/ on startup (trips the safe-delete guard).
  optimizeDeps: {
    exclude: [
      "@sino-purchase/layout-dock",
      "@sino-purchase/sheets-react",
      "@sino-purchase/sheets-core",
      "@sino-purchase/doc-reimburse",
      "@sino-purchase/print",
      "@sino-purchase/doc-utils",
      "@sino-purchase/diff",
      "@sino-purchase/utils",
    ],
  },
  build: {
    target: "es2020",
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
})
