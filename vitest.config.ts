import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: ["packages/desk-ui", "packages/utils", "packages/diff", "packages/doc-utils", "apps/sino-purchase-v2"],
  },
})
