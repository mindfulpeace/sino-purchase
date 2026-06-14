import { lazy, Suspense, useState } from "react"
import { Icon, Switch } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import {
  DockLayout,
  useDock,
} from "@sino-purchase/ui-dock"

const ComponentShowcase = lazy(() => import("./pages/ComponentShowcase"))
const IconShowcase = lazy(() => import("./pages/IconShowcase"))

const fallback = <div className="dv-panel" style={{ color: "var(--text-dim)" }}>Loading…</div>

/* ── Placeholder panel ── */

function PlaceholderPanel({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="dv-placeholder">
      <Icon icon={icon} size={48} />
      <span>{title}</span>
    </div>
  )
}

/* ── Nav panels ── */

function ExplorerPanel() {
  const { openEditor, setStatus, setSummary } = useDock()
  const items = [
    { id: "data-csv", icon: IconNames.DOCUMENT, label: "data.csv" },
    { id: "orders-csv", icon: IconNames.DOCUMENT, label: "orders.csv" },
    { id: "inventory-csv", icon: IconNames.DOCUMENT, label: "inventory.csv" },
  ]
  return (
    <div className="dv-panel">
      <h4>文件浏览器</h4>
      {items.map((item) => (
        <div
          key={item.id}
          className="dv-panel-item"
          onClick={() => {
            openEditor(item.id)
            setStatus(`已打开 ${item.label}`)
            setSummary(`${items.length} 个文件`)
          }}
        >
          <Icon icon={item.icon} size={14} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function SearchPanel() {
  return (
    <div className="dv-panel">
      <h4>搜索</h4>
      <input className="dv-panel-input" placeholder="搜索文件…" />
    </div>
  )
}

function ExamplesPanel() {
  const { openEditor, setStatus, setSummary } = useDock()
  const items = [
    { id: "showcase", icon: IconNames.CUBE, label: "Blueprint Showcase" },
    { id: "icons", icon: IconNames.PALETTE, label: "图标展示" },
    { id: "monaco", icon: IconNames.EDIT, label: "Monaco Editor" },
  ]
  return (
    <div className="dv-panel">
      <h4>组件范例</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="dv-panel-item"
            onClick={() => {
              openEditor(item.id)
              setStatus(`已打开 ${item.label}`)
              setSummary(`${items.length} 个范例`)
            }}
          >
            <Icon icon={item.icon} size={14} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsPanel() {
  const { theme, setTheme, setStatus } = useDock()
  return (
    <div className="dv-panel">
      <h4>设置</h4>
      <Switch
        checked={theme === "dark"}
        label="暗色模式"
        onChange={(e) => {
          const next = (e.target as HTMLInputElement).checked ? "dark" : "light"
          setTheme(next)
          setStatus(`已切换到${next === "dark" ? "暗色" : "亮色"}主题`)
        }}
        style={{ margin: 0, fontSize: 13 }}
      />
    </div>
  )
}

/* ── Header right buttons (consumer) ── */

function HeaderRight() {
  const { setStatus } = useDock()
  return (
    <button
      className="dv-titlebar-btn"
      title="登录 Google"
      onClick={() => setStatus("登录功能由消费者实现")}
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
  { id: "showcase", label: "Blueprint Showcase", content: <Suspense fallback={fallback}><ComponentShowcase /></Suspense> },
  { id: "icons", label: "图标展示", content: <Suspense fallback={fallback}><IconShowcase /></Suspense> },
  { id: "monaco", label: "Monaco Editor", content: <PlaceholderPanel icon={IconNames.EDIT} title="Monaco Editor" /> },
]

/* ── App ── */

function App() {
  return (
    <DockLayout
      title="ui-dock demo"
      headerRight={<HeaderRight />}
      navigation={navigation}
      editors={editors}
      right={{ size: 250, minSize: 180, title: "属性" }}
      bottomEdge={{ size: 150, minSize: 80, title: "终端" }}
      bottom={
        <div className="dv-bottom">
          <h4>终端</h4>
          <pre>~ $</pre>
        </div>
      }
      properties={
        <div className="dv-panel-wide">
          <h4>属性</h4>
          <div>选中内容后显示属性</div>
        </div>
      }
    />
  )
}

export default App
