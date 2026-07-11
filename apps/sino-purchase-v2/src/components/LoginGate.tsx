import { type ReactNode } from "react"
import Button from "@mui/material/Button"
import { useAuth } from "@sino-purchase/sheets-react"
import { Box, Stack } from "./ui"
import { CLIENT_ID } from "../config/sheets"

/**
 * 生产环境登录闸门。
 *
 * 设计意图（见 AGENTS.md「演示模式」约定）：
 * - 开发环境（`npm run dev`，`import.meta.env.PROD === false`）：始终放行，保留 demo 数据便于本地开发。
 * - 生产构建（`npm run build` → 部署）：未登录时不渲染任何业务内容（杜绝 demo 数据外泄），
 *   改为居中展示 Google 登录提示 + 按钮；登录成功后渲染真实应用（数据来自用户自己的 Google Sheets）。
 *
 * 该闸门是「不显示 demo 数据」的唯一来源，无需在各业务模块内逐条剔除 demoData。
 */
const IS_PROD = import.meta.env.PROD

function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function LoginScreen() {
  const { login } = useAuth()
  const configured = !!CLIENT_ID

  return (
    <Box
      className="login-gate"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        background:
          "radial-gradient(120% 120% at 50% 0%, var(--bg-surface) 0%, var(--bg-app) 70%)",
      }}
    >
      <Box
        className="login-card"
        sx={{
          width: 380,
          maxWidth: "100%",
          p: 4,
          background: "var(--bg-surface)",
          border: "3px solid var(--text-primary)",
          borderRadius: 1,
          boxShadow: "8px 8px 0 var(--accent)",
          textAlign: "center",
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--border)",
              borderRadius: "50%",
              background: "var(--bg-elevated)",
            }}
          >
            <GoogleG size={28} />
          </Box>

          <Box sx={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", mt: 1 }}>
            中矿新元 · 采购管理
          </Box>

          <Box sx={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            请登录 Google 账号以访问您的采购数据
          </Box>
          <Box sx={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>
            数据存储在您自己的 Google Sheets，登录后将实时同步。
          </Box>

          {!configured && (
            <Box
              sx={{
                fontSize: 12,
                color: "var(--warn, #d9822b)",
                border: "1px dashed var(--border)",
                borderRadius: 1,
                p: 1,
                mt: 0.5,
              }}
            >
              未检测到 Google OAuth 配置，请联系管理员配置 VITE_CLIENT_ID / VITE_SPREADSHEET_ID。
            </Box>
          )}

          <Button
            onClick={() => void login()}
            variant="contained"
            sx={{
              mt: 1,
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "2px solid var(--text-primary)",
              boxShadow: "3px 3px 0 var(--text-primary)",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              px: 3,
              py: 1,
              "&:hover": {
                transform: "translate(1px, 1px)",
                boxShadow: "2px 2px 0 var(--text-primary)",
              },
              "&:active": {
                transform: "translate(3px, 3px)",
                boxShadow: "0 0 0 var(--text-primary)",
              },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <GoogleG size={18} />
              <span>登录 Google</span>
            </Stack>
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}

export function LoginGate({ children }: { children: ReactNode }) {
  // 开发环境始终放行；生产环境仅在已登录时放行。
  const { loggedIn } = useAuth()
  if (!IS_PROD || loggedIn) return <>{children}</>
  return <LoginScreen />
}
