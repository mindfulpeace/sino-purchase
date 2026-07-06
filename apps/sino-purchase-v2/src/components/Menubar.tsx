import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  type MouseEvent as ReactMouseEvent,
} from "react"
import { createPortal } from "react-dom"

/* ================================================================
   Headless Menubar (Ark UI-style API, self-contained — no deps)
   Menubar / MenuRoot / MenuTrigger / MenuPortal / MenuPositioner /
   MenuPopup / MenuItem / MenuCheckboxItem / MenuSeparator
   ================================================================ */

interface MenubarCtx {
  openId: string | null
  setOpenId: (id: string | null) => void
}
const MenubarContext = createContext<MenubarCtx | null>(null)

interface MenuRootCtx {
  id: string
  open: boolean
  setOpen: (v: boolean) => void
  triggerRef: RefObject<HTMLElement | null>
  popupRef: RefObject<HTMLDivElement | null>
}
const MenuRootContext = createContext<MenuRootCtx | null>(null)

let uid = 0
const nextId = () => `menubar-${++uid}`

export function Menubar({ children, className, style, onClick }: {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: (e: ReactMouseEvent) => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <MenubarContext.Provider value={{ openId, setOpenId }}>
      <div
        className={className}
        onClick={onClick}
        style={{ display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0, ...style }}
      >
        {children}
      </div>
    </MenubarContext.Provider>
  )
}

export function MenuRoot({ children, id }: { children: ReactNode; id?: string }) {
  const ctx = useContext(MenubarContext)
  if (!ctx) throw new Error("MenuRoot must be used within <Menubar>")
  const rid = useRef(id ?? nextId()).current
  const triggerRef = useRef<HTMLElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const open = ctx.openId === rid
  const setOpen = (v: boolean) => ctx.setOpenId(v ? rid : null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t)) return
      if (popupRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, setOpen])

  return (
    <MenuRootContext.Provider value={{ id: rid, open, setOpen, triggerRef, popupRef }}>
      {children}
    </MenuRootContext.Provider>
  )
}

export function MenuTrigger({ children, className, style, title }: {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  title?: string
}) {
  const r = useContext(MenuRootContext)
  if (!r) throw new Error("MenuTrigger must be used within <MenuRoot>")
  return (
    <button
      ref={r.triggerRef as RefObject<HTMLButtonElement>}
      type="button"
      className={className}
      title={title}
      aria-haspopup="menu"
      aria-expanded={r.open}
      onClick={(e) => { e.stopPropagation(); r.setOpen(!r.open) }}
      style={{
        font: "inherit",
        fontSize: 12,
        lineHeight: 1.2,
        padding: "2px 6px",
        borderRadius: 4,
        border: "none",
        cursor: "pointer",
        color: "inherit",
        background: "transparent",
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function MenuPortal({ children }: { children: ReactNode }) {
  return <>{createPortal(children, document.body)}</>
}

export function MenuPositioner({ children, sideOffset = 4, alignOffset = 0 }: {
  children: ReactNode
  sideOffset?: number
  alignOffset?: number
}) {
  const r = useContext(MenuRootContext)
  const [pos, setPos] = useState<CSSProperties | null>(null)

  useLayoutEffect(() => {
    if (!r || !r.open || !r.triggerRef.current) return
    const trigger = r.triggerRef.current
    const margin = 8

    const update = () => {
      const tr = trigger.getBoundingClientRect()
      const popup = r.popupRef.current
      const ph = popup?.offsetHeight ?? 0
      const pw = popup?.offsetWidth ?? 0
      const vh = window.innerHeight
      const vw = window.innerWidth

      // 垂直:优先置于 trigger 下方,空间不足且上方更充裕时翻转到上方
      let top = tr.bottom + sideOffset
      if (top + ph > vh - margin && tr.top - sideOffset - ph > margin) {
        top = tr.top - sideOffset - ph
      }
      top = Math.max(margin, Math.min(top, Math.max(margin, vh - ph - margin)))

      // 水平:钳制在视口内
      let left = tr.left + alignOffset
      left = Math.max(margin, Math.min(left, Math.max(margin, vw - pw - margin)))

      setPos({ position: "fixed", top, left, zIndex: 1400 })
    }

    update()
    // 弹层挂载后尺寸已知,再测量一次以支持翻转
    const raf = requestAnimationFrame(update)
    // 捕获阶段监听,可感知可滚动容器内部的滚动
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [r, r?.open, sideOffset, alignOffset])

  if (!r || !r.open || !pos) return null
  return <div style={pos}>{children}</div>
}

export function MenuPopup({ children, className, style }: {
  children?: ReactNode
  className?: string
  style?: CSSProperties
}) {
  const r = useContext(MenuRootContext)
  if (!r) throw new Error("MenuPopup must be used within <MenuRoot>")
  return (
    <div
      ref={r.popupRef}
      role="menu"
      className={className}
      onClick={(e) => e.stopPropagation()}
      style={{
        minWidth: 110,
        padding: 2,
        background: "var(--bg-surface, #1e1e2e)",
        border: "1px solid var(--border, #3a3a5a)",
        borderRadius: 6,
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function MenuItem({ children, onSelect, hint, className, style }: {
  children?: ReactNode
  onSelect?: () => void
  hint?: string
  className?: string
  style?: CSSProperties
}) {
  const r = useContext(MenuRootContext)
  const [hover, setHover] = useState(false)
  return (
    <div
      role="menuitem"
      className={className}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); r?.setOpen(false) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 8px",
        fontSize: 12,
        cursor: "pointer",
        borderRadius: 4,
        whiteSpace: "nowrap",
        background: hover ? "var(--dv-activegroup-visiblepanel-tab-color, rgba(255,255,255,0.1))" : "transparent",
        ...style,
      }}
    >
      <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>{children}</span>
      {hint && <span style={{ opacity: 0.6, fontSize: 11, marginLeft: "auto" }}>{hint}</span>}
    </div>
  )
}

export function MenuCheckboxItem({ children, checked, onCheckedChange, hint }: {
  children?: ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  hint?: string
}) {
  return (
    <MenuItem onSelect={() => onCheckedChange(!checked)} hint={hint}>
      <span style={{ width: 16, display: "inline-flex", justifyContent: "center", flexShrink: 0 }}>
        {checked ? "✓" : ""}
      </span>
      {children}
    </MenuItem>
  )
}

export function MenuSeparator({ style }: { style?: CSSProperties }) {
  return (
    <div
      role="separator"
      style={{ height: 1, background: "var(--border, #3a3a5a)", margin: "4px 2px", ...style }}
    />
  )
}
