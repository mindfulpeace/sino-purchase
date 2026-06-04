export function Panel({ show, height, onClose }: { show: boolean; height: number; onClose: () => void }) {
  if (!show) return null

  return (
    <div className="panel" style={{ height }}>
      <div className="panel-header">
        <span>Terminal</span>
        <button className="panel-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="panel-content">
        <div className="panel-placeholder">Terminal ready</div>
      </div>
    </div>
  )
}
