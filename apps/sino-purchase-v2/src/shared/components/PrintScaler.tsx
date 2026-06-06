import { useRef, useLayoutEffect, useState, type ReactNode } from "react"

const A4_BASE = 800

interface PrintScalerProps {
  children: ReactNode
}

export default function PrintScaler({ children }: PrintScalerProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = outerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setScale(Math.min(entry.contentRect.width / A4_BASE, 1))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    outer.style.height = inner.getBoundingClientRect().height + "px"
  }, [scale])

  return (
    <div ref={outerRef} className="print-scaler-outer" style={{ overflow: "hidden", width: "100%" }}>
      <div
        ref={innerRef}
        className="print-preview-scaler"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: A4_BASE }}
      >
        {children}
      </div>
    </div>
  )
}