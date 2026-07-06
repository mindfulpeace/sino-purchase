import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"

import "dockview/dist/styles/dockview.css"
import "@sino-purchase/layout-dock/style.css"
import "@sino-purchase/doc-reimburse/style.css"
import "@sino-purchase/print/style.css"
import "./index.css"
import App from "./App.tsx"

const theme = createTheme({
  palette: {
    primary: { main: "#4a90d9" },
    error: { main: "#cd4246" },
    success: { main: "#238551" },
    warning: { main: "#d9822b" },
    text: { primary: "#e0e0e0", secondary: "#858585" },
    background: { default: "#121224", paper: "#1e1e3e" },
    divider: "#3a3a5a",
    action: { hover: "rgba(255,255,255,0.08)" },
  },
  typography: { fontSize: 12, fontFamily: "inherit" },
  shape: { borderRadius: 4 },
  components: {
    MuiButton: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          fontSize: 13,
          padding: "4px 12px",
          lineHeight: "20px",
        },
        sizeSmall: {
          fontSize: 12,
          padding: "2px 8px",
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          fontSize: 12,
          "& .MuiOutlinedInput-root": {
            fontSize: 12,
            fontFamily: "inherit",
            "& fieldset": { borderColor: "var(--border, #3a3a5a)" },
          },
          "& .MuiInputBase-input": { padding: "2px 8px", height: 20 },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { fontSize: 12 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { fontSize: 12 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "var(--bg-surface, #1e1e3e)",
          border: "1px solid var(--border, #3a3a5a)",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          background: "var(--bg-surface, #1e1e3e)",
          border: "1px solid var(--border, #3a3a5a)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontSize: 11 },
        sizeSmall: { height: 18 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: 12 },
      },
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
