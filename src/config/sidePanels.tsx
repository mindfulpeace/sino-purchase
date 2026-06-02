import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { FileTree, projectTreeData } from "../components/FileTree"

export interface SidePanelConfig {
  id: string
  label: string
  render: (callbacks: { openTab: (id: string) => void }) => React.ReactNode
}

export const sidePanels: Record<string, SidePanelConfig> = {
  files: {
    id: "files",
    label: "Explorer",
    render: () => <FileTree nodes={projectTreeData} />,
  },
  search: {
    id: "search",
    label: "Search",
    render: () => <div style={{ padding: 16, color: "var(--text-dim)" }}>Search (placeholder)</div>,
  },
  "source-control": {
    id: "source-control",
    label: "Source Control",
    render: () => <div style={{ padding: 16, color: "var(--text-dim)" }}>Source Control (placeholder)</div>,
  },
  extensions: {
    id: "extensions",
    label: "Extensions",
    render: () => <div style={{ padding: 16, color: "var(--text-dim)" }}>Extensions (placeholder)</div>,
  },
  examples: {
    id: "examples",
    label: "范例",
    render: ({ openTab }) => (
      <div style={{ padding: "8px 0" }}>
        {[
          { id: "csv", label: "CSV 测试", icon: IconNames.GRID_VIEW },
          { id: "showcase", label: "组件展示", icon: IconNames.WIDGET },
          { id: "icons", label: "Icons", icon: IconNames.APPLICATION },
          { id: "monaco", label: "Monaco 展示", icon: IconNames.CODE },
        ].map((item) => (
          <div
            key={item.id}
            onClick={() => openTab(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 20px",
              cursor: "pointer",
              color: "var(--text)",
              fontSize: 13,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Icon icon={item.icon} size={16} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    ),
  },
}
