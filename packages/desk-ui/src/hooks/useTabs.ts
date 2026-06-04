import { useReducer, useState } from "react"
import { useSearchParams } from "react-router-dom"

export interface TabState {
  openIds: string[]
  activeId: string | null
}

export type TabAction =
  | { type: "open"; id: string }
  | { type: "close"; id: string }
  | { type: "activate"; id: string }

export function tabReducer(state: TabState, action: TabAction): TabState {
  switch (action.type) {
    case "open": {
      const openIds = state.openIds.includes(action.id)
        ? state.openIds
        : [...state.openIds, action.id]
      return { openIds, activeId: action.id }
    }
    case "close": {
      const idx = state.openIds.indexOf(action.id)
      const openIds = state.openIds.filter((t) => t !== action.id)
      let activeId = state.activeId
      if (state.activeId === action.id) {
        activeId = openIds.length > 0
          ? openIds[Math.min(idx, openIds.length - 1)]
          : null
      }
      return { openIds, activeId }
    }
    case "activate":
      return state.openIds.includes(action.id)
        ? { ...state, activeId: action.id }
        : state
  }
}

export function useTabs(validIds: string[]) {
  const [searchParams, setSearchParams] = useSearchParams()

  const [initialNavId] = useState(() => searchParams.get("nav") ?? "")

  const [state, dispatch] = useReducer(
    tabReducer,
    null,
    () => {
      const raw = searchParams.get("tabs") ?? ""
      const tabIds = raw.split(",").filter(Boolean).filter((id) => validIds.includes(id))
      const activeFromUrl = searchParams.get("tab") ?? ""
      const activeId = tabIds.includes(activeFromUrl) ? activeFromUrl : null
      return { openIds: tabIds, activeId }
    },
  )

  const sync = (ids: string[], nav: string, activeId?: string | null) => {
    const params = new URLSearchParams()
    if (ids.length > 0) params.set("tabs", ids.join(","))
    if (nav) params.set("nav", nav)
    if (activeId) params.set("tab", activeId)
    setSearchParams(params, { replace: true })
  }

  return { ...state, dispatch, sync, initialNavId }
}
