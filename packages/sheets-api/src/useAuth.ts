import { useState, useEffect } from "react"
import { initAuth, login as authLogin, logout as authLogout, isLoggedIn, onTokenChange } from "./auth"

export function useAuth() {
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())

  useEffect(() => { initAuth().then(() => setReady(true)).catch(() => setReady(false)) }, [])
  useEffect(() => onTokenChange(t => setLoggedIn(!!t)), [])

  return {
    ready,
    loggedIn,
    login: () => authLogin().catch(() => alert("登录失败，请重试")),
    logout: authLogout,
  }
}
