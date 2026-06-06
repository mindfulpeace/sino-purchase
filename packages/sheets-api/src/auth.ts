import { getConfig } from "./config"

const TOKEN_KEY = "sino-purchase-google-token"
const EXPIRES_KEY = "sino-purchase-google-expires"

type TokenResponse = { access_token: string; expires_in: number; scope: string; token_type: string }
type Callback = (token: string) => void

let tokenClient: google.accounts.oauth2.TokenClient | null = null
let accessToken = localStorage.getItem(TOKEN_KEY) || ""
let expiresAt = Number(localStorage.getItem(EXPIRES_KEY) || 0)
let listeners: Callback[] = []

if (accessToken && Date.now() >= expiresAt) {
  accessToken = ""
  expiresAt = 0
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_KEY)
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

export function onTokenChange(cb: Callback): () => void {
  listeners.push(cb)
  if (accessToken) cb(accessToken)
  return () => { listeners = listeners.filter(l => l !== cb) }
}

function broadcast(): void {
  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(EXPIRES_KEY, String(expiresAt))
  } else {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRES_KEY)
  }
  listeners.forEach(l => { try { l(accessToken) } catch { /* ignore */ } })
}

function setToken(token: string, expiresIn: number): void {
  accessToken = token
  expiresAt = Date.now() + expiresIn * 1000
  broadcast()
}

export async function initAuth(): Promise<void> {
  const { clientId, scope } = getConfig()
  await loadGis()
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: scope || "https://www.googleapis.com/auth/spreadsheets",
    callback: (resp: TokenResponse) => {
      setToken(resp.access_token, resp.expires_in)
    },
    error_callback: () => {},
  })
}

export function requestAccessToken(options?: { prompt?: string }): Promise<TokenResponse> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error("Auth not initialized"))
    tokenClient.callback = (resp: TokenResponse) => {
      setToken(resp.access_token, resp.expires_in)
      resolve(resp)
    }
    tokenClient.requestAccessToken(options)
  })
}

export async function requestToken(): Promise<string> {
  if (!accessToken || !expiresAt) return ""
  if (Date.now() < expiresAt - 300000) return accessToken
  return accessToken
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
  broadcast()
  if (t) google.accounts.oauth2.revoke(t, () => {}, () => {})
}

export function getToken(): string { return accessToken }
export function isLoggedIn(): boolean { return !!accessToken }
export function clearToken(): void {
  accessToken = ""
  expiresAt = 0
  broadcast()
}
