import { Section, SectionCard } from "@blueprintjs/core"

export function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section style={{ marginBottom: 24 }}>
      <SectionCard style={{ padding: 0 }}>
        <div className="dv-section-header">{title}</div>
        <div className="dv-section-body">
          {children}
        </div>
      </SectionCard>
    </Section>
  )
}
