import { useState, type ReactNode } from "react"
import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { useTheme } from "../theme/ThemeContext"
import "./VscodeLayout.css"

interface ActivityItem {
  id: string
  icon: ReactNode
  label: string
}

interface SidePanel {
  id: string
  label: string
  render: () => ReactNode
}

interface EditorTab {
  id: string
  label: string
  render: () => ReactNode
}

interface VscodeLayoutProps {
  activities: ActivityItem[]
  sidePanels: Record<string, SidePanel>
  tabs: EditorTab[]
  defaultTab?: string
}

export default function VscodeLayout({ activities, sidePanels, tabs, defaultTab }: VscodeLayoutProps) {
  const { theme, toggle: toggleTheme } = useTheme()
  const [activeActivity, setActiveActivity] = useState(activities[0]?.id ?? "")
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? "")
  const [showPanel, setShowPanel] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [panelHeight] = useState(200)
  const [startX, setStartX] = useState(0)
  const [startSidebarWidth, setStartSidebarWidth] = useState(0)

  const sidebarPanel = sidePanels[activeActivity]

  const handleSidebarResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setStartX(e.clientX)
    setStartSidebarWidth(sidebarWidth)
    const handleMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.max(170, Math.min(500, startSidebarWidth + ev.clientX - startX))
      setSidebarWidth(newWidth)
    }
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div className={`vscode${theme === "light" ? " light" : ""}${theme === "dark" ? " bp6-dark" : " bp6-light"}`}>
      {/* Title Bar */}
      <div className="vscode-titlebar">
        <span className="vscode-titlebar-text">CSV Editor — sino-purchase-v2</span>
      </div>

      <div className="vscode-body">
        {/* Activity Bar */}
        <div className="vscode-activitybar">
          {activities.map((a) => (
            <button
              key={a.id}
              className={`vscode-activitybar-item${activeActivity === a.id ? " active" : ""}`}
              onClick={() => setActiveActivity(activeActivity === a.id ? "" : a.id)}
              title={a.label}
            >
              {a.icon}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            className="vscode-activitybar-item"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <Icon icon={theme === "dark" ? IconNames.MOON : IconNames.LIGHTNING} size={20} />
          </button>
        </div>

        {/* Side Bar */}
        {sidebarPanel && (
          <div className="vscode-sidebar" style={{ width: sidebarWidth }}>
            <div className="vscode-sidebar-header">
              <span>{sidebarPanel.label}</span>
            </div>
            <div className="vscode-sidebar-content">{sidebarPanel.render()}</div>
            <div className="vscode-sidebar-resize" onMouseDown={handleSidebarResizeStart} />
          </div>
        )}

        {/* Editor Area */}
        <div className="vscode-editor-area">
          {tabs.length > 1 && (
            <div className="vscode-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`vscode-tab${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          <div className="vscode-editor-content">
            {tabs.find((t) => t.id === activeTab)?.render()}
          </div>
        </div>
      </div>

      {/* Panel */}
      {showPanel && (
        <div className="vscode-panel" style={{ height: panelHeight }}>
          <div className="vscode-panel-header">
            <span>Terminal</span>
            <button className="vscode-panel-close" onClick={() => setShowPanel(false)}>
              &times;
            </button>
          </div>
          <div className="vscode-panel-content">
            <div className="vscode-panel-placeholder">Terminal ready</div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="vscode-statusbar">
        <div className="vscode-statusbar-left">
          <span className="vscode-statusbar-item" onClick={() => setShowPanel((p) => !p)}>
            {showPanel ? "\u25BC" : "\u25B2"} Terminal
          </span>
        </div>
        <div className="vscode-statusbar-right">
          <span className="vscode-statusbar-item">UTF-8</span>
          <span className="vscode-statusbar-item">TypeScript</span>
          <span className="vscode-statusbar-item">Ln 1, Col 1</span>
          <span className="vscode-statusbar-item">Spaces: 2</span>
        </div>
      </div>
    </div>
  )
}
