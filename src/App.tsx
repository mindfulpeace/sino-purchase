import { type ReactNode } from "react"
import { HotkeysProvider, Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { ThemeProvider } from "./theme/ThemeContext"
import VscodeLayout from "./layout/VscodeLayout"
import CsvEditor from "./pages/CsvEditor"
import ComponentShowcase from "./pages/ComponentShowcase"
import IconShowcase from "./pages/IconShowcase"
import "./App.css"

const activities = [
  { id: "files", icon: <Icon icon={IconNames.FOLDER_OPEN} size={20} />, label: "Explorer" },
  { id: "search", icon: <Icon icon={IconNames.SEARCH} size={20} />, label: "Search" },
  { id: "source-control", icon: <Icon icon={IconNames.GIT_BRANCH} size={20} />, label: "Source Control" },
  { id: "extensions", icon: <Icon icon={IconNames.WIDGET} size={20} />, label: "Extensions" },
]

interface TreeNode {
  name: string
  icon: ReactNode
  children?: TreeNode[]
}

function FileTree({ nodes, depth = 0 }: { nodes: TreeNode[]; depth?: number }) {
  return (
    <ul className="vscode-file-tree">
      {nodes.map((node, i) => (
        <li key={`${depth}-${i}`}>
          {node.children ? (
            <FolderNode node={node} depth={depth} />
          ) : (
            <div className="vscode-file-item" style={{ paddingLeft: 12 + depth * 16 }}>
              <span className="vscode-file-icon">{node.icon}</span>
              {node.name}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

function FolderNode({ node, depth }: { node: TreeNode; depth: number }) {
  return (
    <>
      <div className="vscode-file-item" style={{ paddingLeft: 12 + depth * 16 }}>
        <span className="vscode-chevron">&gt;</span>
        <span className="vscode-file-icon">{node.icon}</span>
        {node.name}
      </div>
      {node.children && <FileTree nodes={node.children} depth={depth + 1} />}
    </>
  )
}

const treeData: TreeNode[] = [
  {
    name: "sino-purchase-v2",
    icon: <Icon icon={IconNames.FOLDER_CLOSE} size={14} />,
    children: [
      {
        name: "src",
        icon: <Icon icon={IconNames.FOLDER_CLOSE} size={14} />,
        children: [
          { name: "App.tsx", icon: <Icon icon={IconNames.CODE} size={14} /> },
          { name: "App.css", icon: <Icon icon={IconNames.CSS_STYLE} size={14} /> },
          { name: "main.tsx", icon: <Icon icon={IconNames.CODE} size={14} /> },
          { name: "index.css", icon: <Icon icon={IconNames.CSS_STYLE} size={14} /> },
          {
            name: "pages",
            icon: <Icon icon={IconNames.FOLDER_CLOSE} size={14} />,
            children: [{ name: "CsvEditor.tsx", icon: <Icon icon={IconNames.CODE} size={14} /> }],
          },
          {
            name: "layout",
            icon: <Icon icon={IconNames.FOLDER_CLOSE} size={14} />,
            children: [{ name: "VscodeLayout.tsx", icon: <Icon icon={IconNames.CODE} size={14} /> }],
          },
        ],
      },
      { name: "package.json", icon: <Icon icon={IconNames.DOCUMENT} size={14} /> },
      { name: "vite.config.ts", icon: <Icon icon={IconNames.CODE} size={14} /> },
      { name: "tsconfig.json", icon: <Icon icon={IconNames.CODE} size={14} /> },
    ],
  },
]

const sidePanels = {
  files: {
    id: "files",
    label: "Explorer",
    render: () => <FileTree nodes={treeData} />,
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

const tabs = [
  { id: "csv", label: "data.csv", render: () => <CsvEditor /> },
  { id: "showcase", label: "Blueprint Showcase", render: () => <ComponentShowcase /> },
  { id: "icons", label: "Icons", render: () => <IconShowcase /> },
]

function App() {
  return (
    <ThemeProvider>
      <HotkeysProvider>
      <VscodeLayout
        activities={activities}
        sidePanels={sidePanels}
        tabs={tabs}
        defaultTab="csv"
      />
      </HotkeysProvider>
    </ThemeProvider>
  )
}

export default App
