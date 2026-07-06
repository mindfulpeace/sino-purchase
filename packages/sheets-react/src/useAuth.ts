import { useState, useEffect } from "react"
import {
  initAuth, login as authLogin, logout as authLogout, isLoggedIn, onTokenChange,
  getCachedUser, getUserInfo,
} from "@sino-purchase/sheets-core"
import type { GoogleUserInfo } from "@sino-purchase/sheets-core"

export function useAuth() {
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())
  const [user, setUser] = useState<GoogleUserInfo | null>(getCachedUser)

  useEffect(() => { initAuth().then(() => setReady(true)).catch(() => setReady(false)) }, [])

  useEffect(() =>
    onTokenChange(t => {
      setLoggedIn(!!t)
      if (t) {
        getUserInfo().then(setUser).catch(() => setUser(null))
      } else {
        setUser(null)
      }
    }),
    [],
  )

  return {
    ready,
    loggedIn,
    user,
    login: () => authLogin().catch(() => alert("登录失败，请重试")),
    logout: authLogout,
  }
}
