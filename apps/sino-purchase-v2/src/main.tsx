import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "dockview/dist/styles/dockview.css"
import "@sino-purchase/layout-dock/style.css"
import "@sino-purchase/doc-reimburse/style.css"
import "@sino-purchase/print/style.css"
import App from "./App.tsx"
import { ThemeProvider } from "./theme/ThemeContext"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
