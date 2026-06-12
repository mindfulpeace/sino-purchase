import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import type { EditorTab } from "../types"

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
        <div className="editor-welcome">
          <Icon icon={IconNames.CODE} size={48} style={{ opacity: 0.15 }} />
          <div className="editor-welcome-title">sino-purchase-v2</div>
          <div>点击左侧菜单栏打开文件</div>
          <div style={{ fontSize: 11 }}>&copy; 2026 — 开始使用</div>
        </div>
      </div>
    )
  }

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
      <div className="editor-content" style={{ display: "flex", flexDirection: "column" }}>
        {openIds.map((id) => {
          const tab = tabs.find((t) => t.id === id)
          if (!tab) return null
          return (
            <div key={id} style={{ display: id === activeId ? "flex" : "none", flex: 1, width: "100%", minHeight: 0, flexDirection: "column" }}>
              {tab.render()}
              {tab.bottomToolbar && id === activeId && (() => {
                const tb = tab.bottomToolbar()
                return tb ? <div className="editor-bottom-toolbar" style={{ flexShrink: 0 }}>{tb}</div> : null
              })()}
            </div>
          )
        })}
      </div>
    </div>
  )
}
