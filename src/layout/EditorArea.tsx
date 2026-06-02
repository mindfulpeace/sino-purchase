import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"

interface EditorTab {
  id: string
  label: string
  render: () => React.ReactNode
}

export function EditorArea({
  openIds,
  activeId,
  tabs,
  onTabChange,
  onTabClose,
}: {
  openIds: string[]
  activeId: string | null
  tabs: EditorTab[]
  onTabChange: (id: string) => void
  onTabClose: (id: string) => void
}) {
  if (openIds.length === 0) {
    return (
      <div className="editor">
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: "var(--text-dim)",
            fontSize: 13,
          }}
        >
          <Icon icon={IconNames.CODE} size={48} style={{ opacity: 0.15 }} />
          <div style={{ fontSize: 16, color: "var(--text-bright)", opacity: 0.4 }}>sino-purchase-v2</div>
          <div>点击左侧菜单栏打开文件</div>
          <div style={{ fontSize: 11 }}>&copy; 2026 — 开始使用</div>
        </div>
      </div>
    )
  }

  const activeTab = tabs.find((t) => t.id === activeId)

  return (
    <div className="editor">
      <div className="editor-tabs">
        {openIds.map((id) => {
          const tab = tabs.find((t) => t.id === id)
          if (!tab) return null
          return (
            <div
              key={id}
              className={`editor-tab${activeId === id ? " active" : ""}`}
              onClick={() => onTabChange(id)}
            >
              <span>{tab.label}</span>
              <span
                className="editor-tab-close"
                onClick={(e) => { e.stopPropagation(); onTabClose(id) }}
              >
                &times;
              </span>
            </div>
          )
        })}
      </div>
      <div className="editor-content">
        {activeTab?.render()}
      </div>
    </div>
  )
}
