import type { ReactNode } from "react"

export function DockMenuItem({ icon, label, onClick }: {
  icon?: ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <div className="dv-panel-item" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </div>
  )
}

export function DockInput({ placeholder, value, onChange }: {
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <input
      className="dv-panel-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}

export function DockPlaceholder({ icon, title }: {
  icon?: ReactNode
  title: string
}) {
  return (
    <div className="dv-placeholder">
      {icon}
      <span>{title}</span>
    </div>
  )
}

export function DockSection({ title, children }: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="dv-panel">
      <h4>{title}</h4>
      {children}
    </div>
  )
}
