import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: ["packages/desk-ui", "packages/utils", "apps/sino-purchase-v2"],
  },
})
