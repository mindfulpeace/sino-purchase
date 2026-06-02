import { FileTree, projectTreeData } from "../components/FileTree"

export interface SidePanelConfig {
  id: string
  label: string
  render: () => React.ReactNode
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
}
