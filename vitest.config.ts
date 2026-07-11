import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
    projects: ["packages/utils", "packages/diff", "packages/doc-utils", "packages/sheets-core", "apps/sino-purchase-v2"],
  },
})
