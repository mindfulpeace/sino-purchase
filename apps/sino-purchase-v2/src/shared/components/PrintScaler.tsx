import { useRef, useLayoutEffect, useState, type ReactNode } from "react"

const A4_BASE = 800

interface PrintScalerProps {
  children: ReactNode
}

/**
 * Scales print content to fit the panel width like a real paper preview.
 * Content renders at its natural A4 width (800px), then CSS transform:scale
 * shrinks it to fit the container width.
 *
 * Key: measure the PARENT's width (not self), because the 800px inner
 * content would otherwise stretch the outer container.
 */
export default function PrintScaler({ children }: PrintScalerProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

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

  // Track inner content height (content may load asynchronously)
  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const updateHeight = () => {
      // scrollHeight = unscaled content height; multiply by scale for visual height
      outer.style.height = inner.scrollHeight * scale + "px"
    }

    updateHeight()

    // Re-measure whenever inner content size changes (e.g. data loads)
    const ro = new ResizeObserver(updateHeight)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [scale])

  return (
    <div
      ref={outerRef}
      className="print-scaler-outer"
      style={{
        width: "100%",
        overflow: "hidden",
      }}
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
  )
}
