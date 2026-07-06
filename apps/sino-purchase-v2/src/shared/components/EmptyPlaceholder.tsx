import type { ReactNode } from "react"
import { Icon, type IconName, Box, Stack } from "../../components/ui"

interface EmptyPlaceholderProps {
  icon?: IconName
  title?: string
  description?: string
  children?: ReactNode
}

export default function EmptyPlaceholder({ icon, title, description, children }: EmptyPlaceholderProps) {
  return (
    <Stack sx={{ flex: 1, width: "100%", height: "100%" }} spacing={1}>
      {icon && <Icon icon={icon} size={40} style={{ opacity: 0.2 }} />}
      {title && <Box>{title}</Box>}
      {description && <Box sx={{ fontSize: 12, opacity: 0.7 }}>{description}</Box>}
      {children}
    </Stack>
  )
}