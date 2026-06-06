import type { ReactNode } from "react"
import { Icon } from "@blueprintjs/core"
import type { IconName } from "@blueprintjs/icons"

interface EmptyPlaceholderProps {
  icon?: IconName
  title?: string
  description?: string
  children?: ReactNode
}

export default function EmptyPlaceholder({ icon, title, description, children }: EmptyPlaceholderProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, width: "100%", height: "100%", gap: 8, color: "var(--text-dim)", fontSize: 14 }}>
      {icon && <Icon icon={icon} size={40} style={{ opacity: 0.2 }} />}
      {title && <div>{title}</div>}
      {description && <div style={{ fontSize: 12, opacity: 0.7 }}>{description}</div>}
      {children}
    </div>
  )
}
