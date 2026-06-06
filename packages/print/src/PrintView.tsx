import type { HTMLAttributes } from "react"

export interface PrintViewProps extends HTMLAttributes<HTMLDivElement> {
}

const PrintView = ({ className, style, children, ...props }: PrintViewProps) => (
  <div className={`print-view ${className || ""}`} style={style} {...props}>
    {children}
  </div>
)

export default PrintView
