import type { SheetsConfig } from "./types"

let _config: SheetsConfig = { clientId: "", spreadsheetId: "" }

export function configure(config: SheetsConfig): void {
  _config = { scope: "https://www.googleapis.com/auth/spreadsheets", ...config }
}

export function getConfig(): SheetsConfig {
  return _config
}
