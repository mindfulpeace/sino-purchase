import { useRightResize } from "../hooks/useSidebarResize"
import type { PropertiesPanel } from "../types"

export function PropertiesBar({
  panel,
  onClose,
}: {
  panel: PropertiesPanel | undefined
  onClose: () => void
}) {
  const { width, handleResizeStart } = useRightResize()

  if (!panel) return null

  return (
    <div className="right" style={{ width }}>
      <div className="right-header">
        <span>{panel.label}</span>
        <button className="right-header-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="right-content">{panel.render()}</div>
      <div className="right-resize" onMouseDown={handleResizeStart} />
    </div>
  )
}
