import { lazy, Suspense } from "react"
import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { ThemeProvider, AppLayout } from "@sino-purchase/ui"
import { CsvProvider } from "./context/CsvContext"
import CsvProperties from "./components/CsvProperties"
import { sidePanels } from "./config/sidePanels"

const CsvEditor = lazy(() => import("./pages/CsvEditor"))
const ComponentShowcase = lazy(() => import("./pages/ComponentShowcase"))
const IconShowcase = lazy(() => import("./pages/IconShowcase"))
const MonacoShowcase = lazy(() => import("./pages/MonacoShowcase"))

const activities = [
  { id: "files", icon: <Icon icon={IconNames.FOLDER_OPEN} size={20} />, label: "Explorer" },
  { id: "search", icon: <Icon icon={IconNames.SEARCH} size={20} />, label: "Search" },
  { id: "source-control", icon: <Icon icon={IconNames.GIT_BRANCH} size={20} />, label: "Source Control" },
  { id: "extensions", icon: <Icon icon={IconNames.WIDGET} size={20} />, label: "Extensions" },
  { id: "examples", icon: <Icon icon={IconNames.CUBE} size={20} />, label: "范例" },
]

const fallback = <div style={{ padding: 20, color: "var(--text-dim)" }}>Loading…</div>

const tabs = [
  { id: "csv", label: "data.csv", render: () => <Suspense fallback={fallback}><CsvEditor /></Suspense> },
  { id: "showcase", label: "Blueprint Showcase", render: () => <Suspense fallback={fallback}><ComponentShowcase /></Suspense> },
  { id: "icons", label: "Icons", render: () => <Suspense fallback={fallback}><IconShowcase /></Suspense> },
  { id: "monaco", label: "Monaco Showcase", render: () => <Suspense fallback={fallback}><MonacoShowcase /></Suspense> },
]

function App() {
  return (
    <ThemeProvider>
      <CsvProvider>
        <AppLayout
          title="CSV Editor — sino-purchase-v2"
          activities={activities}
          sidePanels={sidePanels}
          tabs={tabs}
          propertiesPanel={(activeId) =>
            activeId === "csv"
              ? { id: "csv-prop", label: "属性", render: () => <CsvProperties /> }
              : undefined
          }
        />
      </CsvProvider>
    </ThemeProvider>
  )
}

export default App
