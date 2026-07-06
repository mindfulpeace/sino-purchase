import { defineConfig } from "vitest/config"

// sheets-core 是纯逻辑库（无 React），测试运行于 node 环境。
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
