import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  DockviewReact,
  themeAbyss,
  themeLight,
} from "dockview"
import type { DockviewTheme } from "dockview"
import type {
  DockviewReadyEvent,
  DockviewApi,
  IDockviewPanelProps,
} from "dockview"
import type { DockLayoutProps } from "./types"
import { StatusBar } from "./StatusBar"
import { HeaderToggles } from "./HeaderToggles"

/* ─── Context ─── */

interface DockCtx {
  openEditor: (id: string) => void
  closeEditor: (id: string) => void
  getApi: () => DockviewApi | null
  setLeftVisible: (v: boolean) => void
  setRightVisible: (v: boolean) => void
  setBottomVisible: (v: boolean) => void
  leftVisible: boolean
  rightVisible: boolean
  bottomVisible: boolean
  status: string
  summary: string
  setStatus: (msg: string) => void
  setSummary: (msg: string) => void
  theme: "dark" | "light"
  setTheme: (t: "dark" | "light") => void
}

const Ctx = createContext<DockCtx | null>(null)

export function useDock(): DockCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useDock must be used inside DockLayout")
  return ctx
}

/* ─── Layout ─── */

export function DockLayout({
  title,
  headerRight,
  navigation,
  editors,
  properties,
  bottom,
  left: leftCfg,
  right: rightCfg,
  bottomEdge: bottomCfg,
  defaultTheme = "dark",
  rightDefault = false,
  bottomDefault = false,
  statusBar = true,
  onReady,
}: DockLayoutProps) {
  const apiRef = useRef<DockviewApi | null>(null)
  const editorsRef = useRef(editors)
  editorsRef.current = editors
  const centerGroupRef = useRef<string | null>(null)
  const [leftVisible, setLeftVisible] = useState(true)
  const [rightVisible, setRightVisible] = useState(rightDefault)
  const [bottomVisible, setBottomVisible] = useState(bottomDefault)
  const [status, setStatus] = useState("")
  const [summary, setSummary] = useState("")
  const [theme, setTheme] = useState<"dark" | "light">(defaultTheme)

  const dvTheme: DockviewTheme = theme === "dark" ? themeAbyss : themeLight

  /* openEditor */
  const openEditor = useCallback((id: string) => {
    const api = apiRef.current
    if (!api) return
    const panelId = `editor-${id}`
    const existing = api.getPanel(panelId)
    if (existing) {
      existing.api.setActive()
      return
    }
    const tab = editorsRef.current?.find((e) => e.id === id)
    const panel = api.addPanel({
      id: panelId,
      component: "editorPanel",
      title: tab?.label ?? id,
      params: { editorId: id },
      position: centerGroupRef.current
        ? { referenceGroup: centerGroupRef.current }
        : { direction: "right" },
    })
    if (!centerGroupRef.current) {
      centerGroupRef.current = panel.group.id
    }
  }, [])

  /* closeEditor */
  const closeEditor = useCallback((id: string) => {
    const api = apiRef.current
    if (!api) return
    api.getPanel(`editor-${id}`)?.api.close()
  }, [])

  /* getApi */
  const getApi = useCallback(() => apiRef.current, [])

  /* component map */
  const components = useMemo(() => ({
    navPanel: (props: IDockviewPanelProps) => {
      const navId = props.params?.navId as string | undefined
      const item = navigation.find((n) => n.id === navId)
      return item ? <>{item.content}</> : null
    },
    editorPanel: (props: IDockviewPanelProps) => {
      const edId = props.params?.editorId as string | undefined
      const tab = editorsRef.current?.find((e) => e.id === edId)
      return tab ? <>{tab.content}</> : null
    },
    rightPanel: () => (properties ? <>{properties}</> : null),
    bottomPanel: () => (bottom ? <>{bottom}</> : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [navigation, properties, bottom])

  /* onReady */
  const handleReady = useCallback(
    (event: DockviewReadyEvent) => {
      const { api } = event
      apiRef.current = api

      /* Left edge */
      const leftEdge = api.addEdgeGroup("left", {
        id: "left-edge",
        initialSize: leftCfg?.size ?? 200,
        minimumSize: leftCfg?.minSize ?? 120,
        maximumSize: leftCfg?.maxSize ?? 600,
      })

      navigation.forEach((item, i) => {
        const panel = api.addPanel({
          id: `nav-${item.id}`,
          component: "navPanel",
          title: item.label,
          params: { navId: item.id },
          position: { referenceGroup: leftEdge.id, index: i },
        })
        panel.group.locked = "no-drop-target"
        if (i === 0) panel.api.setActive()
      })

      /* Lock edge groups */
      api.onWillDragPanel((event) => {
        const id = event.panel.id
        if (id.startsWith("nav-") || id === "right-panel" || id === "bottom-panel") {
          event.nativeEvent.preventDefault()
        }
      })
      api.onWillDragGroup((event) => {
        if (event.group.locked) event.nativeEvent.preventDefault()
      })

      /* Right edge */
      if (properties) {
        api.addEdgeGroup("right", {
          id: "right-edge",
          initialSize: rightCfg?.size ?? 200,
          minimumSize: rightCfg?.minSize ?? 150,
          maximumSize: rightCfg?.maxSize,
        })
        const rPanel = api.addPanel({
          id: "right-panel",
          component: "rightPanel",
          title: rightCfg?.title ?? "属性",
          position: { referenceGroup: "right-edge" },
        })
        rPanel.group.locked = true
        api.setEdgeGroupVisible("right", rightDefault)
      }

      /* Bottom edge */
      if (bottom) {
        api.addEdgeGroup("bottom", {
          id: "bottom-edge",
          initialSize: bottomCfg?.size ?? 200,
          minimumSize: bottomCfg?.minSize ?? 60,
          maximumSize: bottomCfg?.maxSize,
        })
        const bPanel = api.addPanel({
          id: "bottom-panel",
          component: "bottomPanel",
          title: bottomCfg?.title ?? "面板",
          position: { referenceGroup: "bottom-edge" },
        })
        bPanel.group.locked = true
        api.setEdgeGroupVisible("bottom", bottomDefault)
      }

      onReady?.(api)
    },
    [navigation, properties, bottom, leftCfg, rightCfg, bottomCfg, rightDefault, bottomDefault, onReady],
  )

  /* sync visibility */
  useEffect(() => { apiRef.current?.setEdgeGroupVisible("left", leftVisible) }, [leftVisible])
  useEffect(() => { apiRef.current?.setEdgeGroupVisible("right", rightVisible) }, [rightVisible])
  useEffect(() => { apiRef.current?.setEdgeGroupVisible("bottom", bottomVisible) }, [bottomVisible])

  /* context */
  const ctx = useMemo<DockCtx>(
    () => ({ openEditor, closeEditor, getApi, setLeftVisible, setRightVisible, setBottomVisible, leftVisible, rightVisible, bottomVisible, status, summary, setStatus, setSummary, theme, setTheme }),
    [openEditor, closeEditor, getApi, leftVisible, rightVisible, bottomVisible, status, summary, theme],
  )

  return (
    <Ctx.Provider value={ctx}>
      <div className={`dv-layout dockview-theme-${theme === "dark" ? "abyss" : "light"}`}>
        <div className="dv-titlebar">
          <span className="dv-titlebar-title">{title}</span>
          <div className="dv-titlebar-right">
            <HeaderToggles />
            {headerRight}
          </div>
        </div>
        <div className="dv-body">
          <DockviewReact components={components} onReady={handleReady} theme={dvTheme} />
        </div>
        {statusBar && <StatusBar left={<>{status}</>} right={<>{summary}</>} />}
      </div>
    </Ctx.Provider>
  )
}
