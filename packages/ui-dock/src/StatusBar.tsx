import type { StatusBarProps } from "./types"

export function StatusBar({ left, right }: StatusBarProps) {
  return (
    <div className="dv-statusbar">
      <div className="dv-statusbar-left">{left}</div>
      <div className="dv-statusbar-right">{right}</div>
    </div>
  )
}
