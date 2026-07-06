import { getConfig } from "./config"

const USER_KEY = "sino-purchase-google-user"

export interface GoogleUserInfo {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
}

type TokenResponse = { access_token: string; expires_in: number; scope: string; token_type: string }
type Callback = (token: string) => void

let tokenClient: google.accounts.oauth2.TokenClient | null = null

// SECURITY (审计 P0-1): OAuth 访问令牌只保存在内存中，绝不写入 localStorage。
// 明文落盘会让任何 XSS 直接窃取令牌。配套措施：
//   1) index.html 中的严格 Content-Security-Policy 阻断未授权脚本注入（消除 XSS 向量）；
//   2) userinfo 仅为非敏感资料，可缓存；令牌本身不持久化。
// 真正的根治方案是后端代理持有令牌（httpOnly cookie 会话），留作后续演进。
let accessToken = ""
let expiresAt = 0
let userInfo: GoogleUserInfo | null = null
let listeners: Callback[] = []

export function onTokenChange(cb: Callback): () => void {
  listeners.push(cb)
  if (accessToken) cb(accessToken)
  return () => { listeners = listeners.filter(l => l !== cb) }
}

function notify(): void {
  listeners.forEach(l => { try { l(accessToken) } catch { /* ignore */ } })
}

function setToken(token: string, expiresIn: number): void {
  accessToken = token
  expiresAt = Date.now() + expiresIn * 1000
  notify()
}

function loadGis(): Promise<void> {
  if (typeof google !== "undefined" && google.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = "https://accounts.google.com/gsi/client"
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Failed to load GSI script"))
    document.head.appendChild(s)
  })
}

let initPromise: Promise<void> | null = null

export function initAuth(): Promise<void> {
  // De-dupe: SheetsProvider and useAuth both call this (and StrictMode double-invokes),
  // so guard with a module-level promise to avoid re-creating the token client.
  if (initPromise) return initPromise
  initPromise = (async () => {
    const { clientId, scope } = getConfig()
    await loadGis()
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: scope || "https://www.googleapis.com/auth/spreadsheets",
      callback: (resp: TokenResponse) => {
        if (resp.access_token) setToken(resp.access_token, resp.expires_in)
      },
      error_callback: () => {},
    })
    // 尝试静默重认证以恢复会话（仅当浏览器仍保有有效 Google 会话时成功）；
    // 失败则保持演示模式，不弹出、不阻塞。
    try {
      await requestAccessToken({ prompt: "none" })
    } catch {
      /* 未登录 / 无授权 —— 保持演示模式 */
    }
  })()
  return initPromise
}

export function requestAccessToken(options?: { prompt?: string }): Promise<TokenResponse> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error("Auth not initialized"))
    tokenClient.callback = (resp: TokenResponse) => {
      if (resp.access_token) {
        setToken(resp.access_token, resp.expires_in)
        resolve(resp)
      } else {
        reject(new Error("Login failed"))
      }
    }
    tokenClient.requestAccessToken(options)
  })
}

export async function requestToken(): Promise<string> {
  if (!accessToken || !expiresAt) return ""
  if (Date.now() < expiresAt) return accessToken
  // GSI tokens have no refresh token and expire after ~1h. Returning the (now
  // invalid) token would cause silent 401 loops in fetchWithAuth; returning ""
  // lets the caller surface a re-login prompt instead.
  return ""
}

export function login(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error("Auth not initialized"))

    const doRequest = (resolve: (v: string) => void, reject: (e: Error) => void) => {
      tokenClient!.callback = (resp: TokenResponse) => {
        if (resp.access_token) {
          setToken(resp.access_token, resp.expires_in)
          resolve(resp.access_token)
        } else {
          reject(new Error("Login failed"))
        }
      }
      tokenClient!.requestAccessToken()
    }

    doRequest(resolve, reject)
  })
}

export function logout(): void {
  const t = accessToken
  accessToken = ""
  expiresAt = 0
  userInfo = null
  notify()
  if (t) google.accounts.oauth2.revoke(t, () => {}, () => {})
}

export function getToken(): string { return accessToken }
export function isLoggedIn(): boolean { return !!accessToken }

export function getCachedUser(): GoogleUserInfo | null {
  if (userInfo) return userInfo
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as GoogleUserInfo) : null
  } catch { return null }
}

export async function getUserInfo(): Promise<GoogleUserInfo> {
  const token = accessToken
  if (!token) throw new Error("未登录")

  // Try cache first
  if (userInfo) return userInfo
  const cached = getCachedUser()
  if (cached) { userInfo = cached; return cached }

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("获取用户信息失败")
  const info: GoogleUserInfo = await res.json()
  userInfo = info
  try { localStorage.setItem(USER_KEY, JSON.stringify(info)) } catch { /* ignore */ }
  return info
}

export function clearToken(): void {
  accessToken = ""
  expiresAt = 0
  userInfo = null
  notify()
}
