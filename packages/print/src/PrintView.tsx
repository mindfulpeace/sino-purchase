import type { HTMLAttributes } from "react"

export interface PrintViewProps extends HTMLAttributes<HTMLDivElement> {
  zoom?: number
}

const PrintView = ({ zoom = 1, className, style, children, ...props }: PrintViewProps) => (
  <div
    className={`print-view ${className || ""}`}
    style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%`, ...style }}
    {...props}
  >
    {children}
  </div>
)

export default PrintView
