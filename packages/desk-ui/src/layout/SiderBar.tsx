import { useSidebarResize } from "../hooks/useSidebarResize"
import type { SidePanel } from "../types"

export function SiderBar({ panel, onOpenTab }: { panel: SidePanel | undefined; onOpenTab: (id: string) => void }) {
  const { sidebarWidth, handleSidebarResizeStart } = useSidebarResize()

  if (!panel) return null

  return (
    <div className="menu" style={{ width: sidebarWidth }}>
      <div className="menu-header">
        <span>{panel.label}</span>
      </div>
      <div className="menu-content">{panel.render({ openTab: onOpenTab })}</div>
      <div className="menu-resize" onMouseDown={handleSidebarResizeStart} />
    </div>
  )
}
