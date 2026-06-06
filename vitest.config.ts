import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: ["packages/desk-ui", "apps/sino-purchase-v2"],
  },
})
