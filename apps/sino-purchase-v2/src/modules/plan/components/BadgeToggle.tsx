import { ToggleButtonGroup, ToggleButton } from "../../../components/ui"

interface BadgeToggleProps<T> {
  values: T[]
  selected: T
  onChange: (v: T) => void
  label: (v: T) => string
  color?: (v: T) => string
  disabled?: boolean
}

export function BadgeToggle<T extends string | number>({ values, selected, onChange, label, color, disabled }: BadgeToggleProps<T>) {
  return (
    <ToggleButtonGroup
      exclusive
      value={selected}
      size="small"
      onChange={(v) => { if (!disabled && v != null) onChange(v as T) }}
    >
      {values.map(v => (
        <ToggleButton key={String(v)} value={v} style={color ? { backgroundColor: color(v) } : undefined}>
          {label(v)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
