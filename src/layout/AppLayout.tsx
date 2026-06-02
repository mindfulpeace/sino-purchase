import { useMemo, useReducer, useState, type ReactNode } from "react"
import { useSearchParams } from "react-router-dom"
import { PortalProvider } from "@blueprintjs/core"
import { useTheme } from "../theme/ThemeContext"
import { TitleBar } from "./TitleBar"
import { ActivityBar } from "./ActivityBar"
import { SiderBar } from "./SiderBar"
import { PropertiesBar, type PropertiesPanelConfig } from "./PropertiesBar"
import { EditorArea } from "./EditorArea"
import { Panel } from "./Panel"
import { StatusBar } from "./StatusBar"
import "./AppLayout.css"
import "./blueprintOverrides.css"

interface ActivityItem {
  id: string
  icon: ReactNode
  label: string
}

interface EditorTab {
  id: string
  label: string
  render: () => ReactNode
}

interface AppLayoutProps {
  activities: ActivityItem[]
  sidePanels: Record<string, { id: string; label: string; render: (callbacks: { openTab: (id: string) => void }) => ReactNode }>
  tabs: EditorTab[]
  propertiesPanel?: (activeTabId: string | null) => PropertiesPanelConfig | undefined
}

interface TabState {
  openIds: string[]
  activeId: string | null
}

type TabAction =
  | { type: "open"; id: string }
  | { type: "close"; id: string }
  | { type: "activate"; id: string }

function tabReducer(state: TabState, action: TabAction): TabState {
  switch (action.type) {
    case "open": {
      const openIds = state.openIds.includes(action.id) ? state.openIds : [...state.openIds, action.id]
      return { openIds, activeId: action.id }
    }
    case "close": {
      const idx = state.openIds.indexOf(action.id)
      const openIds = state.openIds.filter((t) => t !== action.id)
      let activeId = state.activeId
      if (state.activeId === action.id) {
        if (openIds.length > 0) {
          activeId = openIds[Math.min(idx, openIds.length - 1)]
        } else {
          activeId = null
        }
      }
      return { openIds, activeId }
    }
    case "activate":
      return state.openIds.includes(action.id) ? { ...state, activeId: action.id } : state
  }
}

function parseSearchParams(searchParams: URLSearchParams): { tabIds: string[]; navId: string } {
  const tabIds = (searchParams.get("tabs") ?? "").split(",").filter(Boolean)
  const navId = searchParams.get("nav") ?? ""
  return { tabIds, navId }
}

export default function AppLayout({ activities, sidePanels, tabs, propertiesPanel }: AppLayoutProps) {
  const { theme } = useTheme()
  const [searchParams] = useSearchParams()
  const [showPanel, setShowPanel] = useState(false)
  const [showProperties, setShowProperties] = useState(false)

  const initialParams = useMemo(() => parseSearchParams(searchParams), [])
  const initialNav = initialParams.navId && activities.some((a) => a.id === initialParams.navId) ? initialParams.navId : activities[0]?.id ?? ""

  const [activeActivity, setActiveActivity] = useState(initialNav)
  const [tabState, dispatch] = useReducer(tabReducer, {
    openIds: initialParams.tabIds.filter((id) => tabs.some((t) => t.id === id)),
    activeId: null,
  })

  const { openIds, activeId } = tabState

  const currentProperties = useMemo(
    () => (propertiesPanel ? propertiesPanel(activeId) : undefined),
    [propertiesPanel, activeId],
  )

  const syncSearchParams = (ids: string[], nav: string) => {
    const parts: string[] = []
    if (ids.length > 0) parts.push(`tabs=${ids.join(",")}`)
    if (nav) parts.push(`nav=${nav}`)
    window.history.replaceState(null, "", parts.length > 0 ? `?${parts.join("&")}` : window.location.pathname)
  }

  const handleActivityChange = (id: string) => {
    setActiveActivity(id)
    syncSearchParams(openIds, id)
  }

  const openTab = (id: string) => {
    const next = openIds.includes(id) ? openIds : [...openIds, id]
    dispatch({ type: "open", id })
    setShowProperties(true)
    syncSearchParams(next, activeActivity)
  }

  const closeTab = (id: string) => {
    const next = openIds.filter((t) => t !== id)
    dispatch({ type: "close", id })
    syncSearchParams(next, activeActivity)
  }

  const sidebarPanel = sidePanels[activeActivity]
  const rootClass = theme === "dark" ? "bp6-dark" : "bp6-light light"

  return (
    <PortalProvider portalClassName={theme === "dark" ? "bp6-dark" : undefined}>
      <div className={rootClass}>
        <TitleBar />
        <div className="app-body">
          <ActivityBar
            activities={activities}
            activeActivity={activeActivity}
            onActivityChange={handleActivityChange}
          />
          <SiderBar panel={sidebarPanel} onOpenTab={openTab} />
          <EditorArea
            openIds={openIds}
            activeId={activeId}
            tabs={tabs}
            onTabChange={(id) => dispatch({ type: "activate", id })}
            onTabClose={closeTab}
          />
          {showProperties && currentProperties && (
            <PropertiesBar panel={currentProperties} onClose={() => setShowProperties(false)} />
          )}
        </div>
        <Panel show={showPanel} height={200} onClose={() => setShowPanel(false)} />
        <StatusBar
          showPanel={showPanel}
          onPanelToggle={() => setShowPanel((p) => !p)}
          showProperties={showProperties}
          onPropertiesToggle={() => setShowProperties((p) => !p)}
        />
      </div>
    </PortalProvider>
  )
}
