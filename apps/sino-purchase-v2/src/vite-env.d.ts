/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLIENT_ID?: string
  readonly VITE_SPREADSHEET_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
