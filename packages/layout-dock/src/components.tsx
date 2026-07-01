import type { ReactNode } from "react"
import { Icon } from "@blueprintjs/core"
import type { IconName } from "@blueprintjs/icons"

export function DockMenuItem({ icon, label, onClick }: {
  icon?: IconName
  label: string
  onClick?: () => void
}) {
  return (
    <div className="dv-panel-item" onClick={onClick}>
      {icon && <Icon icon={icon} size={14} />}
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
  icon?: IconName
  title: string
}) {
  return (
    <div className="dv-placeholder">
      {icon && <Icon icon={icon} size={48} />}
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
