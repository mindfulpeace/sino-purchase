import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"

export interface TreeNode {
  name: string
  icon: React.ReactNode
  children?: TreeNode[]
}

function FolderNode({ node, depth }: { node: TreeNode; depth: number }) {
  return (
    <>
      <div className="file-item" style={{ paddingLeft: 12 + depth * 16 }}>
        <span className="file-chevron">&gt;</span>
        <span className="file-icon">{node.icon}</span>
        {node.name}
      </div>
      {node.children && <FileTree nodes={node.children} depth={depth + 1} />}
    </>
  )
}

export function FileTree({ nodes, depth = 0 }: { nodes: TreeNode[]; depth?: number }) {
  return (
    <ul className="file-tree">
      {nodes.map((node, i) => (
        <li key={`${depth}-${i}`}>
          {node.children ? (
            <FolderNode node={node} depth={depth} />
          ) : (
            <div className="file-item" style={{ paddingLeft: 12 + depth * 16 }}>
              <span className="file-icon">{node.icon}</span>
              {node.name}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const projectTreeData: TreeNode[] = [
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
            children: [{ name: "AppLayout.tsx", icon: <Icon icon={IconNames.CODE} size={14} /> }],
          },
        ],
      },
      { name: "package.json", icon: <Icon icon={IconNames.DOCUMENT} size={14} /> },
      { name: "vite.config.ts", icon: <Icon icon={IconNames.CODE} size={14} /> },
      { name: "tsconfig.json", icon: <Icon icon={IconNames.CODE} size={14} /> },
    ],
  },
]
