import { ButtonGroup, Button } from "@blueprintjs/core"

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
    <ButtonGroup size="small">
      {values.map(v => (
        <Button
          key={String(v)}
          active={selected === v}
          onClick={() => { if (!disabled) onChange(v) }}
          style={color ? { background: color(v) } : undefined}
        >
          {label(v)}
        </Button>
      ))}
    </ButtonGroup>
  )
}
