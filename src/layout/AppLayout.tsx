import { useMemo, useState, type ReactNode } from "react"
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

export default function AppLayout({ activities, sidePanels, tabs, propertiesPanel }: AppLayoutProps) {
  const { theme } = useTheme()
  const [activeActivity, setActiveActivity] = useState(activities[0]?.id ?? "")
  const [openIds, setOpenIds] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [showProperties, setShowProperties] = useState(false)

  const currentProperties = useMemo(
    () => (propertiesPanel ? propertiesPanel(activeId) : undefined),
    [propertiesPanel, activeId],
  )

  const openTab = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setActiveId(id)
    setShowProperties(true)
  }

  const closeTab = (id: string) => {
    setOpenIds((prev) => {
      const idx = prev.indexOf(id)
      const next = prev.filter((t) => t !== id)
      if (activeId === id) {
        if (next.length > 0) {
          const newIdx = Math.min(idx, next.length - 1)
          setActiveId(next[newIdx])
        } else {
          setActiveId(null)
        }
      }
      return next
    })
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
            onActivityChange={setActiveActivity}
          />
          <SiderBar panel={sidebarPanel} onOpenTab={openTab} />
          <EditorArea
            openIds={openIds}
            activeId={activeId}
            tabs={tabs}
            onTabChange={setActiveId}
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
