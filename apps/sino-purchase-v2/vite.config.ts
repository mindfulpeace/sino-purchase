import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@sino-purchase/desk-ui", "@sino-purchase/sheets-api", "@sino-purchase/utils", "@sino-purchase/doc", "@sino-purchase/print"],
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
})
