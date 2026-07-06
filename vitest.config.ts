import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: ["packages/utils", "packages/diff", "packages/doc-utils", "packages/sheets-core", "apps/sino-purchase-v2"],
  },
})
