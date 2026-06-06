import type { HTMLAttributes } from "react"

const PrintPaper = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`print-paper ${className || ""}`} {...props} />
)

export default PrintPaper
