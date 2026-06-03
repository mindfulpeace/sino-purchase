export function TitleBar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="hdr">
      <span className="hdr-text">{children ?? "CSV Editor"}</span>
    </div>
  )
}
