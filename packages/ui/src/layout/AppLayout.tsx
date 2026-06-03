import { useMemo, useState, type ReactNode } from "react"
import { HotkeysProvider, OverlaysProvider, PortalProvider } from "@blueprintjs/core"
import { useTheme } from "../theme/ThemeContext"
import { useTabs } from "../hooks/useTabs"
import type { Activity, EditorTab, SidePanel, PropertiesPanel } from "../types"
import { TitleBar } from "./TitleBar"
import { ActivityBar } from "./ActivityBar"
import { SiderBar } from "./SiderBar"
import { PropertiesBar } from "./PropertiesBar"
import { EditorArea } from "./EditorArea"
import { Panel } from "./Panel"
import { StatusBar } from "./StatusBar"

interface AppLayoutProps {
  title?: ReactNode
  activities: Activity[]

  sidePanels: Record<string, SidePanel>

  tabs: EditorTab[]

  propertiesPanel?: (activeTabId: string | null) => PropertiesPanel | undefined
}

export default function AppLayout({ title, activities, sidePanels, tabs, propertiesPanel }: AppLayoutProps) {
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
  const rootClass = theme === "dark" ? "bp6-dark" : "bp6-light"

  return (
    <PortalProvider portalClassName={theme === "dark" ? "bp6-dark" : undefined}>
      <OverlaysProvider>
      <HotkeysProvider>
      <div className={"app-root " + rootClass}>
        <TitleBar>{title}</TitleBar>
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
      </HotkeysProvider>
      </OverlaysProvider>
    </PortalProvider>
  )
}
