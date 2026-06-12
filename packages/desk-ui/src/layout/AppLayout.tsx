import { useMemo, useState, type ReactNode } from "react"
import { Icon, HotkeysProvider, OverlaysProvider, PortalProvider } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { useTheme } from "../theme/ThemeContext"
import { useTabs } from "../hooks/useTabs"
import { PropertiesFeedbackProvider } from "../hooks/usePropertiesFeedback"
import type { Activity, EditorTab, SidePanel, PropertiesPanel } from "../types"
import { TitleBar } from "./TitleBar"
import { ActivityBar } from "./ActivityBar"
import { SiderBar } from "./SiderBar"
import { PropertiesBar } from "./PropertiesBar"
import { EditorArea } from "./EditorArea"
import { Panel } from "./Panel"
import { StatusBar } from "./StatusBar"

interface AppLayoutProps {
  title?: ReactNode
  activities: Activity[]
  /** 导航栏底部区域（可放置登录按钮等） */
  activityBarFooter?: ReactNode

  sidePanels: Record<string, SidePanel>

  tabs: EditorTab[]

  propertiesPanel?: (activeTabId: string | null) => PropertiesPanel | undefined
  propertiesMinWidth?: number

  propertiesVisible?: boolean
  onPropertiesVisibleChange?: (visible: boolean) => void

  /** 隐藏底部状态栏 */
  hideStatusBar?: boolean
}

export default function AppLayout({ title, activities, activityBarFooter, sidePanels, tabs, propertiesPanel, propertiesMinWidth, propertiesVisible, onPropertiesVisibleChange, hideStatusBar }: AppLayoutProps) {
  const { theme } = useTheme()
  const [showPanel, setShowPanel] = useState(false)
  const [showMenu, setShowMenu] = useState(true)
  const [showPropertiesInternal, setShowPropertiesInternal] = useState(false)

  const isControlled = propertiesVisible !== undefined
  const showProperties = isControlled ? propertiesVisible : showPropertiesInternal

  const handlePropertiesToggle = () => {
    if (isControlled) {
      onPropertiesVisibleChange?.(!propertiesVisible)
    } else {
      setShowPropertiesInternal(p => !p)
    }
  }

  const handlePropertiesClose = () => {
    if (isControlled) {
      onPropertiesVisibleChange?.(false)
    } else {
      setShowPropertiesInternal(false)
    }
  }

  const tabIds = tabs.map((t) => t.id)
  const { openIds, activeId, dispatch, sync, initialNavId } = useTabs(tabIds)

  const [activeActivity, setActiveActivity] = useState(
    initialNavId && activities.some((a) => a.id === initialNavId)
      ? initialNavId
      : activities[0]?.id ?? "",
  )

  const currentProperties = useMemo(
    () => (propertiesPanel ? propertiesPanel(activeId) : undefined),
    [propertiesPanel, activeId],
  )

  const handleActivityChange = (id: string) => {
    setActiveActivity(id)
    if (tabIds.includes(id)) {
      // Auto-open tab matching the activity
      const next = openIds.includes(id) ? openIds : [...openIds, id]
      dispatch({ type: "open", id })
      if (isControlled) {
        onPropertiesVisibleChange?.(true)
      } else {
        setShowPropertiesInternal(true)
      }
      sync(next, id, id)
    } else {
      sync(openIds, id)
    }
  }

  const openTab = (id: string) => {
    const next = openIds.includes(id) ? openIds : [...openIds, id]
    dispatch({ type: "open", id })
    if (isControlled) {
      onPropertiesVisibleChange?.(true)
    } else {
      setShowPropertiesInternal(true)
    }
    sync(next, activeActivity, id)
  }

  const closeTab = (id: string) => {
    const next = openIds.filter((t) => t !== id)
    dispatch({ type: "close", id })
    const newActiveId = activeId === id
      ? (next.length > 0 ? next[Math.min(openIds.indexOf(id), next.length - 1)] : null)
      : activeId
    sync(next, activeActivity, newActiveId)
  }

  const sidebarPanel = sidePanels[activeActivity]
  const rootClass = theme === "dark" ? "bp6-dark" : "bp6-light"
  const activeTab = activeId ? tabs.find(t => t.id === activeId) : undefined

  const titleRight = (
    <div className="hdr-toggles">
      <button
        className={`hdr-toggle${showMenu ? " active" : ""}`}
        onClick={() => setShowMenu(v => !v)}
        title="切换菜单栏"
      >
        <Icon icon={IconNames.MENU} size={14} />
      </button>
      <button
        className={`hdr-toggle${showProperties ? " active" : ""}`}
        onClick={handlePropertiesToggle}
        title="切换属性栏"
      >
        <Icon icon={IconNames.SETTINGS} size={14} />
      </button>
      <button
        className={`hdr-toggle${showPanel ? " active" : ""}`}
        onClick={() => setShowPanel(v => !v)}
        title="切换面板"
      >
        <Icon icon={showPanel ? IconNames.CHEVRON_DOWN : IconNames.CHEVRON_UP} size={14} />
      </button>
    </div>
  )

  return (
    <PortalProvider portalClassName={theme === "dark" ? "bp6-dark" : undefined}>
      <OverlaysProvider>
      <HotkeysProvider>
      <div className={"app-root " + rootClass}>
        <PropertiesFeedbackProvider>
        <TitleBar rightContent={titleRight}>{title}</TitleBar>
        <div className="app-body">
          <ActivityBar
            activities={activities}
            activeActivity={activeActivity}
            onActivityChange={handleActivityChange}
            footer={activityBarFooter}
          />
          {showMenu && <SiderBar panel={sidebarPanel} onOpenTab={openTab} />}
          <EditorArea
            openIds={openIds}
            activeId={activeId}
            tabs={tabs}
            onTabChange={(id) => {
              dispatch({ type: "activate", id })
              sync(openIds, activeActivity, id)
            }}
            onTabClose={closeTab}
          />
          {showProperties && currentProperties && (
            <PropertiesBar key={currentProperties.id} panel={currentProperties} onClose={handlePropertiesClose} minWidth={propertiesMinWidth} />
          )}
        </div>
        <Panel show={showPanel} height={200} onClose={() => setShowPanel(false)} />
        {!hideStatusBar && (
          <StatusBar
            showPanel={showPanel}
            onPanelToggle={() => setShowPanel((p) => !p)}
            showProperties={showProperties}
            onPropertiesToggle={handlePropertiesToggle}
            statusInfo={activeTab?.statusInfo?.()}
          />
        )}
      </PropertiesFeedbackProvider>
      </div>
      </HotkeysProvider>
      </OverlaysProvider>
    </PortalProvider>
  )
}
