import { Icon } from "@blueprintjs/core"
import { IconNames, type IconName } from "@blueprintjs/icons"

type IconGroup = { group: string; names: IconName[] }

function groupIcons(icons: Record<string, string>): IconGroup[] {
  const iconNames = Object.values(icons) as IconName[]

  const categories: { group: string; patterns: string[] }[] = [
    { group: "Actions", patterns: ["ADD", "REMOVE", "EDIT", "TRASH", "DUPLICATE", "CUT", "SEARCH", "FILTER", "REFRESH", "UNDO", "REDO", "DOWNLOAD", "UPLOAD", "ARCHIVE", "CLIPBOARD"] },
    { group: "Arrows & Chevrons", patterns: ["ARROW", "CHEVRON", "CARET", "DOUBLE_CHEVRON"] },
    { group: "Navigation", patterns: ["CROSS", "TICK", "MINUS", "PLUS", "MENU", "MORE", "DOT", "DASH"] },
    { group: "Files", patterns: ["DOCUMENT", "FOLDER", "FILE", "CODE", "CSS", "CUBE", "DATABASE", "CLIPBOARD"] },
    { group: "UI", patterns: ["WIDGET", "SETTINGS", "USER", "LOCK", "UNLOCK", "STAR", "HEART", "FLAG", "TAG", "TIME", "CALENDAR", "HOME", "HELP"] },
    { group: "Communication", patterns: ["CHAT", "ENVELOPE", "GLOBE", "PHONE", "SHARE", "NOTIFICATIONS", "MESSAGE"] },
    { group: "Media", patterns: ["PLAY", "PAUSE", "STOP", "VOLUME", "MUSIC", "VIDEO", "CAMERA", "IMAGE", "MEDIA"] },
    { group: "Editor", patterns: ["ALIGN", "BOLD", "ITALIC", "UNDERLINE", "HEADING", "LIST", "TEXT", "FONT", "LINK", "ANNOTATION"] },
    { group: "Graph", patterns: ["CHART", "GRAPH", "BAR", "PIE", "TREND", "CURVE"] },
    { group: "Other", patterns: [] },
  ]

  const matched = new Set<IconName>()

  const groups: IconGroup[] = []
  for (const cat of categories) {
    const matchedNames = iconNames.filter((name) => {
      if (matched.has(name)) return false
      const upper = name.toUpperCase().replace(/-/g, "_")
      const matches = cat.patterns.length === 0 || cat.patterns.some((p) => upper.includes(p))
      if (matches) matched.add(name)
      return matches
    })
    if (matchedNames.length > 0) {
      groups.push({ group: cat.group, names: matchedNames })
    }
  }

  return groups
}

const iconGroups = groupIcons(IconNames as unknown as Record<string, string>)

export default function IconShowcase() {
  return (
    <div style={{ overflow: "auto", height: "100%", padding: 24 }}>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>
        @blueprintjs/icons &middot; {iconGroups.reduce((s, g) => s + g.names.length, 0)} icons shown
      </div>
      {iconGroups.map((group) => (
        <div key={group.group} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text-bright)" }}>
            {group.group} ({group.names.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {group.names.map((name) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 72, padding: "8px 4px", border: "1px solid var(--border)", borderRadius: 4 }}>
                <Icon icon={name} size={20} />
                <span style={{ fontSize: 9, textAlign: "center", wordBreak: "break-all", color: "var(--text-dim)", lineHeight: 1.2 }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
