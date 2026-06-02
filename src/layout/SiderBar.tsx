import type { SidePanelConfig } from "../config/sidePanels"
import { useSidebarResize } from "../hooks/useSidebarResize"

export function SiderBar({ panel }: { panel: SidePanelConfig | undefined }) {
  const { sidebarWidth, handleSidebarResizeStart } = useSidebarResize()

  if (!panel) return null

  return (
    <div className="menu" style={{ width: sidebarWidth }}>
      <div className="menu-header">
        <span>{panel.label}</span>
      </div>
      <div className="menu-content">{panel.render()}</div>
      <div className="menu-resize" onMouseDown={handleSidebarResizeStart} />
    </div>
  )
}
