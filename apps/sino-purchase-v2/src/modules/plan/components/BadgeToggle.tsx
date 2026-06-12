interface BadgeToggleProps<T> {
  values: T[]
  selected: T
  onChange: (v: T) => void
  badgeClass: (v: T) => string
  label: (v: T) => string
  disabled?: boolean
}

export function BadgeToggle<T extends string | number>({ values, selected, onChange, badgeClass, label, disabled }: BadgeToggleProps<T>) {
  return (<>{values.map(v => (<button key={String(v)} className={`badge ${badgeClass(v)}${selected === v ? " on" : ""}`} onClick={() => { if (!disabled) onChange(v) }} style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "default" : "pointer" }}>{label(v)}</button>))}</>)
}
