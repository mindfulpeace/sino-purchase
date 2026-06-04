export function StatusBar({
  showPanel,
  onPanelToggle,
  showProperties,
  onPropertiesToggle,
}: {
  showPanel: boolean
  onPanelToggle: () => void
  showProperties: boolean
  onPropertiesToggle: () => void
}) {
  return (
    <div className="status">
      <div className="status-left">
        <span className="status-item" onClick={onPanelToggle}>
          {showPanel ? "\u25BC" : "\u25B2"} Terminal
        </span>
        <span className="status-item" onClick={onPropertiesToggle} style={{ opacity: showProperties ? 1 : 0.5 }}>
          属性
        </span>
      </div>
      <div className="status-right">
        <span className="status-item" onClick={onPanelToggle}>
          {showPanel ? "关闭面板" : "打开面板"}
        </span>
      </div>
    </div>
  )
}
