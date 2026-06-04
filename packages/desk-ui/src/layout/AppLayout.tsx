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

  propertiesVisible?: boolean
  onPropertiesVisibleChange?: (visible: boolean) => void
}

export default function AppLayout({ title, activities, sidePanels, tabs, propertiesPanel, propertiesVisible, onPropertiesVisibleChange }: AppLayoutProps) {
  const { theme } = useTheme()
  const [showPanel, setShowPanel] = useState(false)
  const [showPropertiesInternal, setShowPropertiesInternal] = useState(false)

  const isControlled = propertiesVisible !== undefined
  const showProperties = isControlled ? propertiesVisible : showPropertiesInternal

  const handlePropertiesToggle = () => {
    if (isControlled) {
      onPropertiesVisibleChange?.(!propertiesVisible)
    } else {
      setShowPropertiesInternal(p => !p)
    }
  }

  const handlePropertiesClose = () => {
    if (isControlled) {
      onPropertiesVisibleChange?.(false)
    } else {
      setShowPropertiesInternal(false)
    }
  }

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
    if (isControlled) {
      onPropertiesVisibleChange?.(true)
    } else {
      setShowPropertiesInternal(true)
    }
    sync(next, activeActivity, id)
  }

  const closeTab = (id: string) => {
    const next = openIds.filter((t) => t !== id)
    dispatch({ type: "close", id })
    const newActiveId = activeId === id
      ? (next.length > 0 ? next[Math.min(openIds.indexOf(id), next.length - 1)] : null)
      : activeId
    sync(next, activeActivity, newActiveId)
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
            onTabChange={(id) => {
              dispatch({ type: "activate", id })
              sync(openIds, activeActivity, id)
            }}
            onTabClose={closeTab}
          />
          {showProperties && currentProperties && (
            <PropertiesBar panel={currentProperties} onClose={handlePropertiesClose} />
          )}
        </div>
        <Panel show={showPanel} height={200} onClose={() => setShowPanel(false)} />
        <StatusBar
          showPanel={showPanel}
          onPanelToggle={() => setShowPanel((p) => !p)}
          showProperties={showProperties}
          onPropertiesToggle={handlePropertiesToggle}
        />
      </div>
      </HotkeysProvider>
      </OverlaysProvider>
    </PortalProvider>
  )
}
