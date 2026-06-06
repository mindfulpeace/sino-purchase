interface BadgeToggleProps<T> {
  values: T[]
  selected: T
  onChange: (v: T) => void
  badgeClass: (v: T) => string
  label: (v: T) => string
}

export function BadgeToggle<T extends string | number>({ values, selected, onChange, badgeClass, label }: BadgeToggleProps<T>) {
  return (<>{values.map(v => (<button key={String(v)} className={`badge ${badgeClass(v)}${selected === v ? " on" : ""}`} onClick={() => onChange(v)}>{label(v)}</button>))}</>)
}
