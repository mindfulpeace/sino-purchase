import { useRef, useLayoutEffect, useState, useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"

const A4_BASE = 800

interface PrintScalerProps {
  children: ReactNode
}

/**
 * 双渲染打印组件：
 * - 屏幕预览：在 dockview 面板内，用 transform:scale() 缩放到容器宽度
 * - 打印输出：通过 createPortal 渲染到 body 顶层 (#print-portal-root)，
 *   完全脱离 dockview 布局引擎的 inline style 干扰
 *
 * 两份内容各自独立渲染。打印时 #root 被 CSS 隐藏 (display:none)，
 * 仅 #print-portal-root 可见。这从根本上避免了 dockview JS 布局引擎
 * 在打印期间对内容宽度/transform 的干扰，无需 beforeprint/afterprint
 * 手动操作 DOM，无时序竞态。
 */
export default function PrintScaler({ children }: PrintScalerProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null)

  // 创建或复用 body 顶层的打印 Portal 容器（与 #root 平级）
  useEffect(() => {
    let el = document.getElementById("print-portal-root")
    if (!el) {
      el = document.createElement("div")
      el.id = "print-portal-root"
      document.body.appendChild(el)
    }
    setPortalEl(el)
  }, [])

  // 屏幕预览：测量父容器宽度，计算缩放比例
  useLayoutEffect(() => {
    const el = outerRef.current
    if (!el) return

    // Measure the PARENT's content width, not our own (which may be
    // stretched by the 800px inner content)
    const measure = () => {
      const parent = el.parentElement
      if (!parent) return
      const w = parent.getBoundingClientRect().width
      setScale(w / A4_BASE)
    }

    measure()

    const ro = new ResizeObserver(() => measure())
    if (el.parentElement) ro.observe(el.parentElement)
    return () => ro.disconnect()
  }, [])

  // 屏幕预览：跟踪内容高度（内容可能异步加载）
  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const updateHeight = () => {
      outer.style.height = inner.scrollHeight * scale + "px"
    }

    updateHeight()

    const ro = new ResizeObserver(updateHeight)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [scale])

  return (
    <>
      {/* 屏幕预览：dockview 内，transform 缩放，打印时由 #root{display:none} 隐藏 */}
      <div
        ref={outerRef}
        className="print-scaler-outer"
        style={{ width: "100%", overflow: "hidden" }}
      >
        <div
          ref={innerRef}
          className="print-scaler-inner"
          style={{
            width: A4_BASE,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>

      {/* 打印输出：Portal 到 body 顶层，脱离 dockview，屏幕时由 CSS 隐藏 */}
      {portalEl && createPortal(
        <div className="print-scaler-print">{children}</div>,
        portalEl
      )}
    </>
  )
}
