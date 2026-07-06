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
import type { DockLayoutProps, RightPanelConfig } from "./types"

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
  theme: "dark" | "light"
  setTheme: (t: "dark" | "light") => void
}

const Ctx = createContext<DockCtx | null>(null)

export function useDock(): DockCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useDock must be used inside DockLayout")
  return ctx
}

/* ─── Persisted state (localStorage) ─── */

interface PersistedDockState {
  openEditors: string[]
  activeEditor: string | null
  leftVisible: boolean
  bottomVisible: boolean
  theme: "dark" | "light"
  rightPanels: Record<string, string>
}

/* ─── Layout ─── */

export function DockLayout({
  navigation,
  editors,
  bottom,
  left: leftCfg,
  right: rightCfg,
  bottomEdge: bottomCfg,
  defaultTheme = "dark",
  theme: themeProp,
  rightDefault = true,
  bottomDefault = false,
  rightVisible: rightVisibleProp,
  onRightVisibleChange,
  onReady,
  persistenceKey,
}: DockLayoutProps) {
  const apiRef = useRef<DockviewApi | null>(null)
  const editorsRef = useRef(editors)
  editorsRef.current = editors
  const centerGroupRef = useRef<string | null>(null)
  const rightEdgeRef = useRef<string>("right-edge")
  const rightPanelStateRef = useRef<Map<string, string>>(new Map())
  // Unified right edge open/close intent — shared across all editors.
  // Only updated via setRightVisible() API, never by dockview internal events.
  const rightVisibleRef = useRef(rightDefault)
  /** Tracks open editor IDs independently of dockview — survives dockview destroy. */
  const openedEditorsRef = useRef<Set<string>>(new Set())
  const [leftVisible, setLeftVisible] = useState(true)
  const [_rightVisible, _setRightVisible] = useState(rightDefault)
  const [bottomVisible, setBottomVisible] = useState(bottomDefault)
  const [themeState, setThemeState] = useState<"dark" | "light">(defaultTheme)
  // Controlled theme (when the `theme` prop is supplied) takes precedence over
  // internal state, so the app-level ThemeProvider can drive dockview theming.
  const theme = themeProp !== undefined ? themeProp : themeState
  const setTheme = useCallback(
    (t: "dark" | "light") => {
      if (themeProp === undefined) setThemeState(t)
    },
    [themeProp],
  )
  /** Bumped on open/close to trigger saveState via useEffect (not dockview events). */
  const [editorListVersion, setEditorListVersion] = useState(0)

  /* ─── Refs mirroring state (read by saveState inside dockview event closures) ─── */
  const leftVisibleRef = useRef(leftVisible)
  const bottomVisibleRef = useRef(bottomVisible)
  const themeRef = useRef(theme)
  const activeEditorIdRef = useRef<string | null>(null)
  leftVisibleRef.current = leftVisible
  bottomVisibleRef.current = bottomVisible
  themeRef.current = theme

  // support external control of rightVisible
  const rightVisible = rightVisibleProp !== undefined ? rightVisibleProp : _rightVisible
  rightVisibleRef.current = rightVisible
  const setRightVisible = useCallback((v: boolean) => {
    rightVisibleRef.current = v
    if (onRightVisibleChange) {
      onRightVisibleChange(v)
    } else {
      _setRightVisible(v)
    }
  }, [onRightVisibleChange])

  const dvTheme: DockviewTheme = theme === "dark" ? themeAbyss : themeLight

  /* ─── Persistence: serialize dock state to localStorage ─── */
  const saveState = useCallback(() => {
    if (!persistenceKey) return
    try {
      const openEditors = Array.from(openedEditorsRef.current)
      const rightPanels: Record<string, string> = {}
      rightPanelStateRef.current.forEach((panelId, editorId) => {
        rightPanels[editorId] = panelId
      })
      const state: PersistedDockState = {
        openEditors,
        activeEditor: activeEditorIdRef.current,
        leftVisible: leftVisibleRef.current,
        bottomVisible: bottomVisibleRef.current,
        theme: themeRef.current,
        rightPanels,
      }
      localStorage.setItem(persistenceKey, JSON.stringify(state))
    } catch {
      // localStorage unavailable or full — silently skip
    }
  }, [persistenceKey])

  /* ─── Right panel management ─── */

  const [activeEditorId, setActiveEditorId] = useState<string | null>(null)

  /** Build right panels for the given editor, preserving active state.
   *  Right edge fold/expand uses a unified intent (rightVisibleRef),
   *  shared across all editors — switching editors never changes it. */
  const syncRightPanels = useCallback(
    (editorId: string) => {
      const api = apiRef.current
      if (!api) return

      const tab = editorsRef.current?.find((e) => e.id === editorId)
      const panels: RightPanelConfig[] = tab?.rightPanels ?? []

      const rightEdgeId = rightEdgeRef.current

      // Before changing panels, capture dockview's actual right edge state.
      // This catches user-initiated collapses (via tab header click) that
      // bypassed setRightVisible().
      const hasRightPanelsNow = api.panels.some(
        (p) => p.id.startsWith("right-") && !p.id.startsWith("right-edge")
      )
      if (hasRightPanelsNow) {
        rightVisibleRef.current = api.isEdgeGroupVisible("right")
      }

      // Add new panels FIRST (before removing old ones) so the edge never
      // becomes empty and auto-collapses.
      const activePanelId = rightPanelStateRef.current.get(editorId)
      let activePanelSet = false

      panels.forEach((panelCfg, i) => {
        const panelId = `right-${panelCfg.id}`
        const existing = api.getPanel(panelId)
        if (!existing) {
          const panel = api.addPanel({
            id: panelId,
            component: "rightPanel",
            title: panelCfg.label,
            params: { panelId: panelCfg.id, editorId },
            position: { referenceGroup: rightEdgeId, index: i },
          })
          panel.group.locked = true
        }

        if (activePanelId === panelCfg.id || (!activePanelId && i === 0)) {
          api.getPanel(panelId)?.api.setActive()
          activePanelSet = true
        }
      })

      // Now remove old panels that don't belong to this editor
      const existingPanels = api.panels.filter(
        (p) => p.id.startsWith("right-") && !p.id.startsWith("right-edge")
      )
      const newPanelIds = new Set(panels.map((p) => `right-${p.id}`))

      for (const p of existingPanels) {
        if (!newPanelIds.has(p.id)) {
          p.api.close()
        }
      }

      // No panels — dockview auto-collapses; don't touch the unified intent.
      if (panels.length === 0) {
        // Explicitly hide the edge (cleaner than relying on auto-collapse)
        // but keep rightVisibleRef unchanged so it can be restored later.
        api.setEdgeGroupVisible("right", false)
        return
      }

      // Fallback: activate first panel if saved state no longer matches
      if (!activePanelSet) {
        const firstPanelId = `right-${panels[0].id}`
        api.getPanel(firstPanelId)?.api.setActive()
      }

      // Apply the unified open/close intent
      api.setEdgeGroupVisible("right", rightVisibleRef.current)
    },
    [],
  )

  /* ─── Editor management ─── */

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
    const groupExists = centerGroupRef.current
      ? api.groups.some((g) => g.id === centerGroupRef.current)
      : false
    const panel = api.addPanel({
      id: panelId,
      component: "editorPanel",
      title: tab?.label ?? id,
      params: { editorId: id },
      position: groupExists
        ? { referenceGroup: centerGroupRef.current! }
        : { direction: "right" },
    })
    centerGroupRef.current = panel.group.id
    openedEditorsRef.current.add(id)
    setEditorListVersion((v) => v + 1)
  }, [])

  const closeEditor = useCallback((id: string) => {
    const api = apiRef.current
    if (!api) return
    api.getPanel(`editor-${id}`)?.api.close()
  }, [])

  const getApi = useCallback(() => apiRef.current, [])

  /* ─── Component map ─── */

  const components = useMemo(() => ({
    navPanel: (props: IDockviewPanelProps) => {
      const navId = props.params?.navId as string | undefined
      const item = navigation.find((n) => n.id === navId)
      return item ? <div className="layout-dock-left">{item.content}</div> : null
    },
    editorPanel: (props: IDockviewPanelProps) => {
      const edId = props.params?.editorId as string | undefined
      const tab = editorsRef.current?.find((e) => e.id === edId)
      return tab ? <div className="layout-dock-center">{tab.content}</div> : null
    },
    rightPanel: (props: IDockviewPanelProps) => {
      const panelId = props.params?.panelId as string | undefined
      const edId = props.params?.editorId as string | undefined
      const tab = editorsRef.current?.find((e) => e.id === edId)
      const panelCfg = tab?.rightPanels?.find((p) => p.id === panelId)
      return panelCfg ? <div className="layout-dock-right">{panelCfg.content}</div> : null
    },
    bottomPanel: () => (bottom ? <div className="layout-dock-bottom">{bottom}</div> : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [navigation, bottom])

  /* ─── onReady ─── */

  const handleReady = useCallback(
    (event: DockviewReadyEvent) => {
      const { api } = event
      apiRef.current = api

      /* Left edge — navigation tabs */
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
        if (id.startsWith("nav-") || id.startsWith("right-") || id === "bottom-panel") {
          event.nativeEvent.preventDefault()
        }
      })
      api.onWillDragGroup((event) => {
        if (event.group.locked) event.nativeEvent.preventDefault()
      })

      /* Right edge — created always (will hold per-editor right panels) */
      api.addEdgeGroup("right", {
        id: "right-edge",
        initialSize: rightCfg?.size ?? 200,
        minimumSize: rightCfg?.minSize ?? 150,
        maximumSize: rightCfg?.maxSize,
      })
      api.setEdgeGroupVisible("right", rightDefault)

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
          title: "面板",
          position: { referenceGroup: "bottom-edge" },
        })
        bPanel.group.locked = true
        api.setEdgeGroupVisible("bottom", bottomDefault)
      }

      /* Track active editor and right panel changes */
      api.onDidActivePanelChange((panel) => {
        if (panel?.id?.startsWith("editor-")) {
          const editorId = panel.id.replace("editor-", "")
          if (editorId !== activeEditorIdRef.current) {
            activeEditorIdRef.current = editorId
            setActiveEditorId(editorId)
          }
        } else if (panel?.id?.startsWith("right-")) {
          const editorId = panel.params?.editorId as string | undefined
          const panelId = panel.id.replace("right-", "")
          if (editorId) {
            rightPanelStateRef.current.set(editorId, panelId)
          }
        }
        // saveState handled by useEffect on activeEditorId change
      })

      /* When an editor panel is closed: if no editor remains, clear right edge.
         Otherwise syncRightPanels handles cleanup via onDidActivePanelChange. */
      api.onDidRemovePanel((panel) => {
        if (panel.id.startsWith("editor-")) {
          const closedEditorId = panel.id.replace("editor-", "")
          openedEditorsRef.current.delete(closedEditorId)
          rightPanelStateRef.current.delete(closedEditorId)
          const hasEditor = api.panels.some((p) => p.id.startsWith("editor-"))
          if (!hasEditor) {
            // Last editor closed — clear all right panels
            const toRemove = api.panels.filter(
              (p) => p.id.startsWith("right-") && !p.id.startsWith("right-edge")
            )
            toRemove.forEach((p) => p.api.close())
            activeEditorIdRef.current = null
            setActiveEditorId(null)
          }
          // If other editors remain, onDidActivePanelChange will trigger
          // syncRightPanels which removes old right panels and adds new ones.
          // Bump version to trigger saveState via useEffect.
          // During StrictMode unmount, React ignores setState so localStorage
          // is not overwritten with empty state.
          setEditorListVersion((v) => v + 1)
        }
        // saveState handled by useEffect on editorListVersion/activeEditorId change
      })

      /* Restore persisted dock state (editors, visibility, theme) */
      if (persistenceKey) {
        try {
          const raw = localStorage.getItem(persistenceKey)
          if (raw) {
            const saved = JSON.parse(raw) as PersistedDockState

            // Restore visibility & theme first (state + ref, so saveState reads correct values)
            if (typeof saved.leftVisible === "boolean") {
              setLeftVisible(saved.leftVisible)
              leftVisibleRef.current = saved.leftVisible
            }
            if (typeof saved.bottomVisible === "boolean") {
              setBottomVisible(saved.bottomVisible)
              bottomVisibleRef.current = saved.bottomVisible
            }
            if (themeProp === undefined && (saved.theme === "dark" || saved.theme === "light")) {
              setTheme(saved.theme)
              themeRef.current = saved.theme
            }

            // Restore right-panel active states (consumed by syncRightPanels effect)
            if (saved.rightPanels) {
              for (const [editorId, panelId] of Object.entries(saved.rightPanels)) {
                rightPanelStateRef.current.set(editorId, panelId)
              }
            }

            // Restore open editors (filter out ids no longer in config)
            const validEditorIds = new Set((editorsRef.current ?? []).map((e) => e.id))
            const validEditors = (saved.openEditors ?? []).filter((id) =>
              validEditorIds.has(id),
            )
            validEditors.forEach((id) => openEditor(id))

            // Restore active editor
            if (saved.activeEditor && validEditorIds.has(saved.activeEditor)) {
              api.getPanel(`editor-${saved.activeEditor}`)?.api.setActive()
            }

            saveState()
          }
        } catch {
          // localStorage corrupted — silently skip, start fresh
        }
      }

      onReady?.(api)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigation, bottom, leftCfg, rightCfg, bottomCfg, rightDefault, bottomDefault, onReady, openEditor, saveState],
  )

  /* Sync right panels when active editor changes; clear when none */
  useEffect(() => {
    if (activeEditorId) {
      syncRightPanels(activeEditorId)
    } else {
      // No active editor — remove all right panels
      const api = apiRef.current
      if (!api) return
      const rightPanels = api.panels.filter(
        (p) => p.id.startsWith("right-") && !p.id.startsWith("right-edge")
      )
      rightPanels.forEach((p) => p.api.close())
    }
  }, [activeEditorId, syncRightPanels])

  /* sync visibility */
  useEffect(() => { apiRef.current?.setEdgeGroupVisible("left", leftVisible) }, [leftVisible])
  useEffect(() => { apiRef.current?.setEdgeGroupVisible("bottom", bottomVisible) }, [bottomVisible])

  /* persist state when visibility/theme/editors/active change */
  useEffect(() => { saveState() }, [leftVisible, bottomVisible, theme, activeEditorId, editorListVersion, saveState])

  /* context */
  const ctx = useMemo<DockCtx>(
    () => ({
      openEditor,
      closeEditor,
      getApi,
      setLeftVisible,
      setRightVisible,
      setBottomVisible,
      leftVisible,
      rightVisible,
      bottomVisible,
      theme,
      setTheme,
    }),
    [openEditor, closeEditor, getApi, leftVisible, rightVisible, bottomVisible, theme, setTheme],
  )

  return (
    <Ctx.Provider value={ctx}>
      <div className={`dv-layout dockview-theme-${theme === "dark" ? "abyss" : "light"}`}>
        <div className="dv-body">
          <DockviewReact components={components} onReady={handleReady} theme={dvTheme} />
        </div>
      </div>
    </Ctx.Provider>
  )
}
