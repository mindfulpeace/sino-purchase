/// <reference types="vitest/config" />
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import { resolve } from "path"
import { fileURLToPath } from "url"

const dirname = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  plugins: [react(), dts({
    tsconfigPath: "./tsconfig.json",
    beforeWriteFile: (filePath, content) => ({
      filePath: filePath.replace("/src/", "/"),
      content,
    }),
  })],
  build: {
    lib: {
      entry: resolve(dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "@sino-purchase/doc-utils"],
    },
  },
})
