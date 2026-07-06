import { createTheme, type Theme, type ThemeOptions } from "@mui/material/styles"

export type ColorMode = "dark" | "light"

/**
 * 设计令牌的单一来源（single source of truth）。
 * 之前散落在 index.css 的 :root 变量与 MUI palette 里的重复色值，现在统一在此定义，
 * 并同步注入为 CSS 变量（见 MuiCssBaseline 的 :root 规则），供内联 var(--x) 与 MUI 主题共用。
 */
export const designTokens = {
  dark: {
    textDim: "#858585",
    bgApp: "#121224",
    bgSurface: "#1e1e3e",
    bgElevated: "#26264a",
    border: "#3a3a5a",
    divider: "#3a3a5a",
    textPrimary: "#e0e0e0",
    textSecondary: "#858585",
    accent: "#4a90d9",
    accentHover: "#5a9ee0",
    bgHover: "rgba(255,255,255,0.06)",
    scrollbarThumb: "#3a3a5a",
    scrollbarTrack: "transparent",
  },
  light: {
    textDim: "#888888",
    bgApp: "#f4f5f7",
    bgSurface: "#ffffff",
    bgElevated: "#ffffff",
    border: "#d8dce3",
    divider: "#d8dce3",
    textPrimary: "#1a1a2e",
    textSecondary: "#5a5a72",
    accent: "#2f6fb3",
    accentHover: "#3a7fc0",
    bgHover: "rgba(0,0,0,0.05)",
    scrollbarThumb: "#c4c9d2",
    scrollbarTrack: "transparent",
  },
} as const

/** 任务列表语义色（跨模块复用的高亮配色），下沉到主题后可用 sx={{ color: "task.qty" }} 引用。 */
export const taskColors = {
  name: "#ffffff",
  qty: "#9ac4bb",
  prc: "#d2bba4",
  sup: "#c8b9d8",
  bok: "#cbbc88",
} as const

// MUI 调色板增强：让 palette.task.* 成为一等公民
declare module "@mui/material/styles" {
  interface Palette {
    task: typeof taskColors
  }
  interface PaletteOptions {
    task?: typeof taskColors
  }
}

/** 把令牌展开成 :root CSS 变量声明（保持旧内联 var(--x) 用法继续可用）。 */
function tokenVars(t: (typeof designTokens)[ColorMode]): Record<string, string> {
  return {
    "--text-dim": t.textDim,
    "--bg-app": t.bgApp,
    "--bg-surface": t.bgSurface,
    "--bg-elevated": t.bgElevated,
    "--border": t.border,
    "--divider": t.divider,
    "--text-primary": t.textPrimary,
    "--text-secondary": t.textSecondary,
    "--accent": t.accent,
    "--accent-hover": t.accentHover,
    "--bg-hover": t.bgHover,
    "--scrollbar-thumb": t.scrollbarThumb,
    "--scrollbar-track": t.scrollbarTrack,
  }
}

function buildMuiTheme(mode: ColorMode): Theme {
  const t = designTokens[mode]
  const dark = mode === "dark"

  const components: ThemeOptions["components"] = {
    MuiCssBaseline: {
      styleOverrides: {
        "*, *::before, *::after": { boxSizing: "border-box" },
        "html, body, #root": { height: "100%" },
        body: {
          margin: 0,
          padding: 0,
          overflow: "hidden",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
          background: t.bgApp,
          color: t.textPrimary,
          colorScheme: mode,
        },
        // 滚动条跟随主题（Firefox + WebKit）
        "*": { scrollbarWidth: "thin", scrollbarColor: `${t.scrollbarThumb} ${t.scrollbarTrack}` },
        "::-webkit-scrollbar": { width: 10, height: 10 },
        "::-webkit-scrollbar-thumb": { background: t.scrollbarThumb, borderRadius: 5 },
        "button:focus, input:focus": { outline: "none" },
        // 设计令牌注入为 CSS 变量，主题切换时随 mode 重建而更新
        ":root": tokenVars(t),
      },
    },
    MuiButton: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: { fontSize: 13, padding: "4px 12px", lineHeight: "20px" },
        sizeSmall: { fontSize: 12, padding: "2px 8px" },
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
    MuiSelect: { styleOverrides: { select: { fontSize: 12 } } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: 12 } } },
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
    MuiChip: { styleOverrides: { root: { fontSize: 11 }, sizeSmall: { height: 18 } } },
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: 12 } } },
    MuiCircularProgress: { defaultProps: { color: "primary" } },
  }

  return createTheme({
    palette: {
      mode,
      primary: { main: t.accent },
      error: { main: dark ? "#cd4246" : "#c0322f" },
      success: { main: dark ? "#238551" : "#1f7a48" },
      warning: { main: dark ? "#d9822b" : "#b9701f" },
      text: { primary: t.textPrimary, secondary: t.textSecondary },
      background: { default: t.bgApp, paper: t.bgSurface },
      divider: t.divider,
      action: { hover: t.bgHover },
      task: taskColors,
    },
    typography: { fontSize: 12, fontFamily: "inherit" },
    shape: { borderRadius: 4 },
    components,
  })
}

export { buildMuiTheme }
