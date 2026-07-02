import { useRef, useLayoutEffect, useState, useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"

const A4_BASE_DEFAULT = 800

export interface PrintPreviewProps {
  children: ReactNode
  /** A4 基准宽度（像素），内容按此宽度渲染后缩放到容器，默认 800 */
  baseWidth?: number
}

/**
 * 双渲染打印预览组件：
 *
 * - **屏幕预览**：`transform: scale()` 缩放到容器宽度，模拟 A4 纸张效果
 * - **打印输出**：`createPortal` 渲染到 `document.body` 顶层 (`#print-portal-root`)，
 *   脱离任何布局引擎（如 dockview）的 inline style 干扰
 *
 * 打印时 `#root` 被 CSS 隐藏 (`display: none`)，仅 `#print-portal-root` 可见。
 * 无 `beforeprint`/`afterprint` DOM 操作，无时序竞态。
 *
 * @example
 * ```tsx
 * import { PrintPreview, PrintView, PrintPaper } from "@sino-purchase/print"
 *
 * <PrintPreview>
 *   <PrintView>
 *     <PrintPaper>...</PrintPaper>
 *   </PrintView>
 * </PrintPreview>
 * ```
 */
export default function PrintPreview({ children, baseWidth = A4_BASE_DEFAULT }: PrintPreviewProps) {
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

    const measure = () => {
      const parent = el.parentElement
      if (!parent) return
      setScale(parent.getBoundingClientRect().width / baseWidth)
    }

    measure()

    const ro = new ResizeObserver(() => measure())
    if (el.parentElement) ro.observe(el.parentElement)
    return () => ro.disconnect()
  }, [baseWidth])

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
      {/* 屏幕预览：容器内 transform 缩放，打印时由 #root{display:none} 隐藏 */}
      <div
        ref={outerRef}
        className="print-preview-outer"
        style={{ width: "100%", overflow: "hidden" }}
      >
        <div
          ref={innerRef}
          className="print-preview-inner"
          style={{
            width: baseWidth,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>

      {/* 打印输出：Portal 到 body 顶层，脱离布局引擎，屏幕时由 CSS 隐藏 */}
      {portalEl && createPortal(
        <div className="print-preview-print">{children}</div>,
        portalEl
      )}
    </>
  )
}
