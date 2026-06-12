import { useRightResize } from "../hooks/useSidebarResize"
import { usePropertiesFeedback } from "../hooks/usePropertiesFeedback"
import type { PropertiesPanel } from "../types"

function FeedbackDisplay() {
  const { messages, clear } = usePropertiesFeedback()
  if (messages.length === 0) return null
  return (
    <div className="right-feedback">
      <div className="right-feedback-msgs">
        {messages.map(m => (
          <div key={m.id} className={`right-feedback-msg right-feedback-${m.level}`}>{m.text}</div>
        ))}
      </div>
      <button className="right-feedback-clear" onClick={clear} title="清除">&times;</button>
    </div>
  )
}

export function PropertiesBar({
  panel,
  onClose,
  minWidth,
}: {
  panel: PropertiesPanel | undefined
  onClose: () => void
  minWidth?: number
}) {
  const { width, handleResizeStart } = useRightResize(435, minWidth)

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
      <FeedbackDisplay />
      <div className="right-resize" onMouseDown={handleResizeStart} />
    </div>
  )
}
