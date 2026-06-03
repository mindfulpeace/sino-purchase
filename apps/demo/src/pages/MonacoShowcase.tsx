import { useState } from "react"
import MonacoEditor from "@monaco-editor/react"
import { useTheme } from "@sino-purchase/ui"

const samples: Record<string, string> = {
  TypeScript: `interface User {
  name: string
  age: number
  email?: string
}

function greet(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age}.\`
}

const alice: User = { name: "Alice", age: 30 }
console.log(greet(alice))`,

  JavaScript: `// Simple reactive state
function createSignal(initial) {
  let value = initial
  const listeners = new Set()
  return {
    get() { return value },
    set(next) { value = next; listeners.forEach(fn => fn(value)) },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
  }
}

const count = createSignal(0)
count.subscribe(v => console.log("count:", v))
count.set(1)`,

  CSS: `.editor-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-surface);
}

.editor-tabs {
  display: flex;
  background: var(--bg-raised);
  overflow-x: auto;
}

.editor-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 35px;
  padding: 0 10px 0 14px;
  cursor: pointer;
  color: var(--text-dim);
}`,

  JSON: `{
  "name": "sino-purchase-v2",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@blueprintjs/core": "^6.15.0",
    "@blueprintjs/icons": "^6.0.0",
    "@blueprintjs/table": "^6.1.1"
  }
}`,

  HTML: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>sino-purchase-v2</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,

  Markdown: `# sino-purchase-v2

A VS Code-style CSV editor built with:

- **React 19** + **Vite 8** + **TypeScript 6**
- **Blueprint 6** UI components
- **Monaco Editor** for CSV text editing
- **papaparse** for CSV parsing

## Features

- Monaco + Blueprint Table2 dual-pane CSV editing
- Dark/light theme toggle
- Resizable panels
- Extensible tab system`,
}

const languages = Object.keys(samples)

export default function MonacoShowcase() {
  const { theme } = useTheme()
  const [lang, setLang] = useState("TypeScript")

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", gap: 4, padding: "8px 12px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        {languages.map((name) => (
          <button
            key={name}
            onClick={() => setLang(name)}
            style={{
              padding: "4px 12px",
              border: `1px solid ${lang === name ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 4,
              background: lang === name ? "var(--accent)" : "transparent",
              color: lang === name ? "#fff" : "var(--text-dim)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <MonacoEditor
          height="100%"
          language={lang.toLowerCase()}
          theme={theme === "dark" ? "vs-dark" : "light"}
          value={samples[lang]}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: "on",
            renderWhitespace: "selection",
          }}
        />
      </div>
    </div>
  )
}
