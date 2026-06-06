import { useRef, useLayoutEffect, useState, type ReactNode } from "react"

const A4_BASE = 800

interface PrintScalerProps {
  children: ReactNode
}

export default function PrintScaler({ children }: PrintScalerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setScale(Math.min(w / A4_BASE, 1))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ overflow: "hidden", width: "100%" }}>
      <div
        className="print-preview-scaler"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: A4_BASE }}
      >
        {children}
      </div>
    </div>
  )
}
