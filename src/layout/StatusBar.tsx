export function StatusBar({ showPanel, onPanelToggle }: { showPanel: boolean; onPanelToggle: () => void }) {
  return (
    <div className="status">
      <div className="status-left">
        <span className="status-item" onClick={onPanelToggle}>
          {showPanel ? "\u25BC" : "\u25B2"} Terminal
        </span>
      </div>
      <div className="status-right">
        <span className="status-item">UTF-8</span>
        <span className="status-item">TypeScript</span>
        <span className="status-item">Ln 1, Col 1</span>
        <span className="status-item">Spaces: 2</span>
      </div>
    </div>
  )
}
