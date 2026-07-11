export { configure } from "./config"
export type { SheetsConfig, SyncOp, SyncStatus, SheetConfig } from "./types"
export type { LoadTableResult } from "./db"

export {
  initAuth, requestToken, login, logout,
  getToken, isLoggedIn, clearToken, onTokenChange,
  getUserInfo, getCachedUser,
} from "./auth"
export type { GoogleUserInfo } from "./auth"

export {
  loadTable, insertRow, updateRow, deleteRow, appendRows, batchUpdateRows,
  processQueue, findRow, listSheets,
  isRetryableStatus, SheetsApiError,
} from "./db"

export { enqueue, queueLen, loadQueue, CHANGE_EVENT, SYNC_ERROR_EVENT } from "./sync-queue"
