import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { resolve } from "path"
import { fileURLToPath } from "url"

const dirname = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  plugins: [dts({
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
  },
})
