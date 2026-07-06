// 凭据改为环境变量注入，避免在源码中硬编码真实 Google OAuth Client ID 与
// Spreadsheet ID（审计 P0-2）。真实值放在 .env（已被 .gitignore 忽略，不会提交），
// 占位模板见同目录 .env.example。未配置时降级为演示模式。
const envClientId = import.meta.env.VITE_CLIENT_ID
const envSpreadsheetId = import.meta.env.VITE_SPREADSHEET_ID

export const CLIENT_ID = envClientId ?? ""
export const SPREADSHEET_ID = envSpreadsheetId ?? ""

if (!CLIENT_ID || !SPREADSHEET_ID) {
  // eslint-disable-next-line no-console
  console.warn(
    "[sheets] 未检测到 VITE_CLIENT_ID / VITE_SPREADSHEET_ID，已切换为演示模式。" +
      "请将 .env.example 复制为 .env 并填入真实值。",
  )
}
