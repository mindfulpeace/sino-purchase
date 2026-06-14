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
      <Icon icon={icon} size={48} />
      <span>{title}</span>
    </div>
  )
}

/* ── Nav panel content components ── */

function ExplorerPanel() {
  const { openEditor, setStatusMessage, setContentSummary } = useDeskDockview()
  const items = [
    { id: "data-csv", icon: IconNames.DOCUMENT, label: "data.csv" },
    { id: "orders-csv", icon: IconNames.DOCUMENT, label: "orders.csv" },
    { id: "inventory-csv", icon: IconNames.DOCUMENT, label: "inventory.csv" },
  ]
  return (
    <div style={{ padding: 8 }}>
      <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
        文件浏览器
      </h4>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => {
            openEditor(item.id)
            setStatusMessage(`已打开 ${item.label}`)
            setContentSummary(`${items.length} 个文件`)
          }}
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
          <span><Icon icon={item.icon} size={14} /></span>
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
  const { openEditor, setStatusMessage, setContentSummary } = useDeskDockview()
  const items = [
    { id: "showcase", icon: IconNames.CUBE, label: "Blueprint Showcase" },
    { id: "icons", icon: IconNames.PALETTE, label: "图标展示" },
    { id: "monaco", icon: IconNames.EDIT, label: "Monaco Editor" },
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
            onClick={() => {
              openEditor(item.id)
              setStatusMessage(`已打开 ${item.label}`)
              setContentSummary(`${items.length} 个范例`)
            }}
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
            <span><Icon icon={item.icon} size={14} /></span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsPanel() {
  const { theme, setTheme, setStatusMessage } = useDeskDockview()
  return (
    <div style={{ padding: 8 }}>
      <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>
        设置
      </h4>
      <Switch
        checked={theme === "dark"}
        label="暗色模式"
        onChange={(e) => {
          const next = (e.target as HTMLInputElement).checked ? "dark" : "light"
          setTheme(next)
          setStatusMessage(`已切换到${next === "dark" ? "暗色" : "亮色"}主题`)
        }}
        style={{ margin: 0, fontSize: 13 }}
      />
    </div>
  )
}

/* ── Header right buttons (consumer) ── */

function HeaderRight() {
  const { setStatusMessage } = useDeskDockview()
  return (
    <button
      className="dv-titlebar-btn"
      title="登录 Google"
      onClick={() => setStatusMessage("登录功能由消费者实现")}
    >
      <Icon icon={IconNames.LOG_IN} size={14} />
    </button>
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
  { id: "data-csv", label: "data.csv", content: <PlaceholderPanel icon={IconNames.DOCUMENT} title="data.csv" /> },
  { id: "orders-csv", label: "orders.csv", content: <PlaceholderPanel icon={IconNames.DOCUMENT} title="orders.csv" /> },
  { id: "inventory-csv", label: "inventory.csv", content: <PlaceholderPanel icon={IconNames.DOCUMENT} title="inventory.csv" /> },
  { id: "showcase", label: "Blueprint Showcase", content: <PlaceholderPanel icon={IconNames.CUBE} title="Blueprint Showcase" /> },
  { id: "icons", label: "图标展示", content: <PlaceholderPanel icon={IconNames.PALETTE} title="图标展示" /> },
  { id: "monaco", label: "Monaco Editor", content: <PlaceholderPanel icon={IconNames.EDIT} title="Monaco Editor" /> },
]

/* ── App ── */

function App() {
  return (
    <DeskDockviewLayout
      title="ui-dock demo"
      headerRight={<HeaderRight />}
      navigation={navigation}
      editors={editors}
      bottom={
        <div style={{ padding: 8, fontSize: 12 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>终端</h4>
          <div style={{ fontFamily: "monospace", opacity: 0.7 }}>~ $</div>
        </div>
      }
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
