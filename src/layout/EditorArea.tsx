interface EditorTab {
  id: string
  label: string
  render: () => React.ReactNode
}

export function EditorArea({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: EditorTab[]
  activeTab: string
  onTabChange: (id: string) => void
}) {
  return (
    <div className="editor">
      {tabs.length > 1 && (
        <div className="editor-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`editor-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <div className="editor-content">
        {tabs.find((t) => t.id === activeTab)?.render()}
      </div>
    </div>
  )
}
