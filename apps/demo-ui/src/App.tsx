import { useState } from "react"
import { Icon, Switch } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import {
  DeskDockviewLayout,
  useDeskDockview,
} from "@sino-purchase/ui-dock"

/* ── A centered placeholder panel ── */

function PlaceholderPanel({ icon, title }: { icon: string; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        fontSize: 16,
        gap: 12,
      }}
    >
      <span style={{ fontSize: 48 }}>{icon}</span>
      <span>{title}</span>
    </div>
  )
}

/* ── Nav panel content components ── */

function ExplorerPanel() {
  const { openEditor } = useDeskDockview()
  const items = [
    { id: "data-csv", icon: "📄", label: "data.csv" },
    { id: "orders-csv", icon: "📄", label: "orders.csv" },
    { id: "inventory-csv", icon: "📄", label: "inventory.csv" },
  ]
  return (
    <div style={{ padding: 8 }}>
      <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
        文件浏览器
      </h4>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => openEditor(item.id)}
          style={{
            padding: "6px 8px",
            cursor: "pointer",
            borderRadius: 4,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "color-mix(in srgb, var(--dv-activegroup-visiblepanel-tab-color) 8%, transparent)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function SearchPanel() {
  return (
    <div style={{ padding: 8 }}>
      <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
        搜索
      </h4>
      <input
        placeholder="搜索文件…"
        style={{
          width: "100%",
          padding: "6px 8px",
          borderRadius: 4,
          border: "1px solid var(--dv-separator-border)",
          background: "var(--dv-tabs-and-actions-container-background-color)",
          fontSize: 12,
          outline: "none",
        }}
      />
    </div>
  )
}

function ExamplesPanel() {
  const { openEditor } = useDeskDockview()
  const items = [
    { id: "showcase", icon: "🧩", label: "Blueprint Showcase" },
    { id: "icons", icon: "🎨", label: "图标展示" },
    { id: "monaco", icon: "📝", label: "Monaco Editor" },
  ]
  return (
    <div style={{ padding: 8 }}>
      <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
        组件范例
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => openEditor(item.id)}
            style={{
              padding: "6px 8px",
              cursor: "pointer",
              borderRadius: 4,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "color-mix(in srgb, var(--dv-activegroup-visiblepanel-tab-color) 8%, transparent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsPanel() {
  const [isDark, setIsDark] = useState(true)

  const handleToggle = (checked: boolean) => {
    setIsDark(checked)
    const html = document.documentElement
    const shell = document.querySelector(".dv-shell")
    if (checked) {
      html.classList.remove("bp6-theme-light")
      shell?.classList.remove("dockview-theme-light")
      shell?.classList.add("dockview-theme-dark")
    } else {
      html.classList.add("bp6-theme-light")
      shell?.classList.remove("dockview-theme-dark")
      shell?.classList.add("dockview-theme-light")
    }
  }

  return (
    <div style={{ padding: 8 }}>
      <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
        设置
      </h4>
      <Switch
        checked={isDark}
        label="暗色模式"
        onChange={(e) => handleToggle((e.target as HTMLInputElement).checked)}
        style={{ margin: 0, fontSize: 13 }}
      />
    </div>
  )
}

/* ── Navigation config ── */

const navigation = [
  {
    id: "files",
    icon: <Icon icon={IconNames.FOLDER_OPEN} size={20} />,
    label: "Explorer",
    content: <ExplorerPanel />,
  },
  {
    id: "search",
    icon: <Icon icon={IconNames.SEARCH} size={20} />,
    label: "Search",
    content: <SearchPanel />,
  },
  {
    id: "examples",
    icon: <Icon icon={IconNames.CUBE} size={20} />,
    label: "范例",
    content: <ExamplesPanel />,
  },
  {
    id: "settings",
    icon: <Icon icon={IconNames.COG} size={20} />,
    label: "设置",
    content: <SettingsPanel />,
  },
]

/* ── Editor definitions ── */

const editors = [
  { id: "data-csv", label: "data.csv", content: <PlaceholderPanel icon="📄" title="data.csv" /> },
  { id: "orders-csv", label: "orders.csv", content: <PlaceholderPanel icon="📄" title="orders.csv" /> },
  { id: "inventory-csv", label: "inventory.csv", content: <PlaceholderPanel icon="📄" title="inventory.csv" /> },
  { id: "showcase", label: "Blueprint Showcase", content: <PlaceholderPanel icon="🧩" title="Blueprint Showcase" /> },
  { id: "icons", label: "图标展示", content: <PlaceholderPanel icon="🎨" title="图标展示" /> },
  { id: "monaco", label: "Monaco Editor", content: <PlaceholderPanel icon="📝" title="Monaco Editor" /> },
]

/* ── App ── */

function App() {
  return (
    <DeskDockviewLayout
      title="CSV Editor — dockview demo"
      navigation={navigation}
      editors={editors}
      properties={
        <div style={{ padding: 12 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
            属性
          </h4>
          <div style={{ fontSize: 12 }}>
            选中内容后显示属性
          </div>
        </div>
      }
    />
  )
}

export default App
