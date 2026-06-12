export function TitleBar({ children, rightContent }: { children?: React.ReactNode; rightContent?: React.ReactNode }) {
  return (
    <div className="hdr">
      <span className="hdr-text">{children ?? "CSV Editor"}</span>
      {rightContent && <div className="hdr-right">{rightContent}</div>}
    </div>
  )
}
