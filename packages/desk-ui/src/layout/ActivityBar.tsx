import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { useTheme } from "../theme/ThemeContext"
import type { Activity } from "../types"

export function ActivityBar({
  activities,
  activeActivity,
  onActivityChange,
}: {
  activities: Activity[]
  activeActivity: string
  onActivityChange: (id: string) => void
}) {
  const { theme, toggle: toggleTheme } = useTheme()

  return (
    <div className="nav">
      {activities.map((a) => (
        <button
          key={a.id}
          className={`nav-item${activeActivity === a.id ? " active" : ""}`}
          onClick={() => onActivityChange(activeActivity === a.id ? "" : a.id)}
          title={a.label}
        >
          {a.icon}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <button
        className="nav-item"
        onClick={toggleTheme}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      >
        <Icon icon={theme === "dark" ? IconNames.MOON : IconNames.LIGHTNING} size={20} />
      </button>
    </div>
  )
}
