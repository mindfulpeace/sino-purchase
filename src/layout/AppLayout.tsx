import { useState, type ReactNode } from "react"
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
  sidePanels: Record<string, { id: string; label: string; render: () => ReactNode }>
  tabs: EditorTab[]
  defaultTab?: string
  propertiesPanel?: PropertiesPanelConfig
}

export default function AppLayout({ activities, sidePanels, tabs, defaultTab, propertiesPanel }: AppLayoutProps) {
  const { theme } = useTheme()
  const [activeActivity, setActiveActivity] = useState(activities[0]?.id ?? "")
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? "")
  const [showPanel, setShowPanel] = useState(false)
  const [showProperties, setShowProperties] = useState(!!propertiesPanel)

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
          <SiderBar panel={sidebarPanel} />
          <EditorArea
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {showProperties && propertiesPanel && (
            <PropertiesBar panel={propertiesPanel} onClose={() => setShowProperties(false)} />
          )}
        </div>
        <Panel show={showPanel} height={200} onClose={() => setShowPanel(false)} />
        <StatusBar showPanel={showPanel} onPanelToggle={() => setShowPanel((p) => !p)} />
      </div>
    </PortalProvider>
  )
}
