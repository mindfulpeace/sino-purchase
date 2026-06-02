import { Icon } from "@blueprintjs/core"
import { IconNames, type IconName } from "@blueprintjs/icons"

const iconGroups: { group: string; names: IconName[] }[] = [
  { group: "Actions", names: [IconNames.ADD, IconNames.REMOVE, IconNames.EDIT, IconNames.TRASH, IconNames.DUPLICATE, IconNames.CUT, IconNames.SEARCH, IconNames.FILTER, IconNames.REFRESH, IconNames.UNDO, IconNames.REDO, IconNames.DOWNLOAD, IconNames.UPLOAD, IconNames.ADD_TO_FOLDER, IconNames.ARCHIVE, IconNames.CLIPBOARD] },
  { group: "Navigation", names: [IconNames.ARROW_RIGHT, IconNames.ARROW_LEFT, IconNames.ARROW_UP, IconNames.ARROW_DOWN, IconNames.CHEVRON_RIGHT, IconNames.CHEVRON_DOWN, IconNames.CHEVRON_UP, IconNames.CARET_DOWN, IconNames.CROSS, IconNames.TICK, IconNames.MINUS, IconNames.PLUS, IconNames.MENU, IconNames.MORE] },
  { group: "Files", names: [IconNames.DOCUMENT, IconNames.FOLDER_CLOSE, IconNames.FOLDER_OPEN, IconNames.FOLDER_NEW, IconNames.CODE, IconNames.CSS_STYLE, IconNames.CUBE, IconNames.DATABASE] },
  { group: "UI", names: [IconNames.WIDGET, IconNames.SETTINGS, IconNames.USER, IconNames.LOCK, IconNames.UNLOCK, IconNames.STAR, IconNames.HEART, IconNames.FLAG, IconNames.TAG, IconNames.TIME, IconNames.CALENDAR, IconNames.HOME, IconNames.INFO_SIGN, IconNames.HELP] },
  { group: "Communication", names: [IconNames.CHAT, IconNames.ENVELOPE, IconNames.GLOBE, IconNames.PHONE, IconNames.SHARE, IconNames.NOTIFICATIONS, IconNames.NOTIFICATIONS_UPDATED] },
  { group: "Media", names: [IconNames.PLAY, IconNames.PAUSE, IconNames.STOP, IconNames.VOLUME_UP, IconNames.VOLUME_OFF, IconNames.MUSIC, IconNames.VIDEO, IconNames.CAMERA, IconNames.IMAGE_ROTATE_LEFT, IconNames.IMAGE_ROTATE_RIGHT] },
]

export default function IconShowcase() {
  return (
    <div style={{ overflow: "auto", height: "100%", padding: 24 }}>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>
        @blueprintjs/icons &middot; {Object.keys(IconNames).length} icons
      </div>
      {iconGroups.map((group) => (
        <div key={group.group} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text-bright)" }}>{group.group}</div>
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
