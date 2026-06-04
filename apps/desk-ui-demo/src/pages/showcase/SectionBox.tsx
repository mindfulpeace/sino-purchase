import { Section, SectionCard } from "@blueprintjs/core"

export function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section style={{ marginBottom: 24 }}>
      <SectionCard style={{ padding: 0 }}>
        <div style={{ padding: "12px 16px", fontWeight: 600, fontSize: 15, borderBottom: "1px solid var(--border)", color: "var(--text-bright)" }}>
          {title}
        </div>
        <div style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          {children}
        </div>
      </SectionCard>
    </Section>
  )
}
