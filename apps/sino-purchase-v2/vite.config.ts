import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  base: "",
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@sino-purchase\/doc$/, replacement: path.resolve(__dirname, "../../packages/doc/src") },
      { find: /^@sino-purchase\/doc\/style\.css$/, replacement: path.resolve(__dirname, "../../packages/doc/dist/index.css") },
      { find: /^@sino-purchase\/print$/, replacement: path.resolve(__dirname, "../../packages/print/src") },
      { find: /^@sino-purchase\/print\/style\.css$/, replacement: path.resolve(__dirname, "../../packages/print/dist/index.css") },
      { find: /^@sino-purchase\/utils$/, replacement: path.resolve(__dirname, "../../packages/utils/src") },
    ],
  },
  optimizeDeps: {
    exclude: ["@sino-purchase/desk-ui", "@sino-purchase/sheets-api", "@sino-purchase/utils", "@sino-purchase/doc", "@sino-purchase/print"],
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
})
