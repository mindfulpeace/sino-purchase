import { useDock } from "./DockLayout"

/* ── VS Code style solid/outline SVG icons ── */

function SidebarLeftIcon({ solid }: { solid: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="2" width="14" height="12" rx="1" />
      {solid
        ? <rect x="1" y="2" width="4" height="12" rx="1" fill="currentColor" stroke="none" />
        : <line x1="5" y1="2" x2="5" y2="14" />}
    </svg>
  )
}

function PanelBottomIcon({ solid }: { solid: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="2" width="14" height="12" rx="1" />
      {solid
        ? <rect x="1" y="10" width="14" height="4" rx="1" fill="currentColor" stroke="none" />
        : <line x1="1" y1="10" x2="15" y2="10" />}
    </svg>
  )
}

function SidebarRightIcon({ solid }: { solid: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="2" width="14" height="12" rx="1" />
      {solid
        ? <rect x="11" y="2" width="4" height="12" rx="1" fill="currentColor" stroke="none" />
        : <line x1="11" y1="2" x2="11" y2="14" />}
    </svg>
  )
}

export function HeaderToggles() {
  const { leftVisible, setLeftVisible, rightVisible, setRightVisible, bottomVisible, setBottomVisible } = useDock()

  return (
    <>
      <button
        className="dv-titlebar-btn"
        title="切换左侧栏"
        onClick={() => setLeftVisible(!leftVisible)}
      >
        <SidebarLeftIcon solid={leftVisible} />
      </button>
      <button
        className="dv-titlebar-btn"
        title="切换面板"
        onClick={() => setBottomVisible(!bottomVisible)}
      >
        <PanelBottomIcon solid={bottomVisible} />
      </button>
      <button
        className="dv-titlebar-btn"
        title="切换右侧栏"
        onClick={() => setRightVisible(!rightVisible)}
      >
        <SidebarRightIcon solid={rightVisible} />
      </button>
    </>
  )
}
