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
  themeDark,
} from "dockview"
import type {
  DockviewReadyEvent,
  DockviewApi,
  IDockviewPanelProps,
} from "dockview"
import type { DeskDockviewLayoutProps } from "./types"

/* ─── Context for child components ─── */

interface DeskDockviewCtx {
  openEditor: (id: string) => void
  setRightVisible: (v: boolean) => void
  setBottomVisible: (v: boolean) => void
  rightVisible: boolean
  bottomVisible: boolean
}

const Ctx = createContext<DeskDockviewCtx | null>(null)

export function useDeskDockview(): DeskDockviewCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useDeskDockview must be used inside DeskDockviewLayout")
  return ctx
}

/* ─── Main Layout ─── */

export function DeskDockviewLayout({
  title,
  navigation,
  editors,
  properties,
  bottom,
}: DeskDockviewLayoutProps) {
  const apiRef = useRef<DockviewApi | null>(null)
  const editorsRef = useRef(editors)
  editorsRef.current = editors
  const centerGroupRef = useRef<string | null>(null)
  const [rightVisible, setRightVisible] = useState(false)
  const [bottomVisible, setBottomVisible] = useState(false)

  /* openEditor — called from nav panel child components */
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
    // First editor creates a center group; subsequent ones join it
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

  /* dockview component map */
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

  /* onReady — set up edge groups */
  const onReady = useCallback(
    (event: DockviewReadyEvent) => {
      const { api } = event
      apiRef.current = api

      /* ── Left edge: navigation tabs (locked) ── */
      const leftEdge = api.addEdgeGroup("left", {
        id: "left-edge",
        initialSize: 300,
        minimumSize: 120,
        maximumSize: 600,
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

      /* ── Lock edge groups: prevent panel drag-out, group drag, and close ── */
      api.onWillDragPanel((event) => {
        const id = event.panel.id
        if (id.startsWith("nav-") || id === "right-panel" || id === "bottom-panel") {
          event.nativeEvent.preventDefault()
        }
      })
      api.onWillDragGroup((event) => {
        if (event.group.locked) {
          event.nativeEvent.preventDefault()
        }
      })

      /* ── Right edge: properties ── */
      if (properties) {
        api.addEdgeGroup("right", {
          id: "right-edge",
          initialSize: 350,
          minimumSize: 200,
        })
        const rPanel = api.addPanel({
          id: "right-panel",
          component: "rightPanel",
          title: "属性",
          position: { referenceGroup: "right-edge" },
        })
        rPanel.group.locked = true
        api.setEdgeGroupVisible("right", false)
      }

      /* ── Bottom edge ── */
      if (bottom) {
        api.addEdgeGroup("bottom", {
          id: "bottom-edge",
          initialSize: 200,
          minimumSize: 60,
        })
        const bPanel = api.addPanel({
          id: "bottom-panel",
          component: "bottomPanel",
          title: "面板",
          position: { referenceGroup: "bottom-edge" },
        })
        bPanel.group.locked = true
        api.setEdgeGroupVisible("bottom", false)
      }
    },
    [navigation, properties, bottom],
  )

  /* sync visibility state */
  useEffect(() => {
    apiRef.current?.setEdgeGroupVisible("right", rightVisible)
  }, [rightVisible])

  useEffect(() => {
    apiRef.current?.setEdgeGroupVisible("bottom", bottomVisible)
  }, [bottomVisible])

  /* context value */
  const ctx = useMemo<DeskDockviewCtx>(
    () => ({ openEditor, setRightVisible, setBottomVisible, rightVisible, bottomVisible }),
    [openEditor, rightVisible, bottomVisible],
  )

  return (
    <Ctx.Provider value={ctx}>
      <div className="dv-layout">
        {title && (
          <div className="dv-titlebar">
            <span className="dv-titlebar-title">{title}</span>
          </div>
        )}
        <div className="dv-body">
          <DockviewReact
            components={components}
            onReady={onReady}
            theme={themeDark}
          />
        </div>
      </div>
    </Ctx.Provider>
  )
}
