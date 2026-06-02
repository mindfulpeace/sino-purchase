import { useMemo, useState, type ReactNode } from "react"
import { PortalProvider } from "@blueprintjs/core"
import { useTheme } from "../theme/ThemeContext"
import { useTabs } from "../hooks/useTabs"
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

export default function AppLayout({ activities, sidePanels, tabs, propertiesPanel }: AppLayoutProps) {
  const { theme } = useTheme()
  const [showPanel, setShowPanel] = useState(false)
  const [showProperties, setShowProperties] = useState(false)

  const tabIds = tabs.map((t) => t.id)
  const { openIds, activeId, dispatch, sync, initialNavId } = useTabs(tabIds)

  const [activeActivity, setActiveActivity] = useState(
    initialNavId && activities.some((a) => a.id === initialNavId)
      ? initialNavId
      : activities[0]?.id ?? "",
  )

  const currentProperties = useMemo(
    () => (propertiesPanel ? propertiesPanel(activeId) : undefined),
    [propertiesPanel, activeId],
  )

  const handleActivityChange = (id: string) => {
    setActiveActivity(id)
    sync(openIds, id)
  }

  const openTab = (id: string) => {
    const next = openIds.includes(id) ? openIds : [...openIds, id]
    dispatch({ type: "open", id })
    setShowProperties(true)
    sync(next, activeActivity)
  }

  const closeTab = (id: string) => {
    const next = openIds.filter((t) => t !== id)
    dispatch({ type: "close", id })
    sync(next, activeActivity)
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
