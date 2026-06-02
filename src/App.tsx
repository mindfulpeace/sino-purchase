import { HotkeysProvider, Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { ThemeProvider } from "./theme/ThemeContext"
import { CsvProvider } from "./context/CsvContext"
import AppLayout from "./layout/AppLayout"
import CsvEditor from "./pages/CsvEditor"
import CsvProperties from "./components/CsvProperties"
import ComponentShowcase from "./pages/ComponentShowcase"
import IconShowcase from "./pages/IconShowcase"
import { sidePanels } from "./config/sidePanels"
import "./App.css"

const activities = [
  { id: "files", icon: <Icon icon={IconNames.FOLDER_OPEN} size={20} />, label: "Explorer" },
  { id: "search", icon: <Icon icon={IconNames.SEARCH} size={20} />, label: "Search" },
  { id: "source-control", icon: <Icon icon={IconNames.GIT_BRANCH} size={20} />, label: "Source Control" },
  { id: "extensions", icon: <Icon icon={IconNames.WIDGET} size={20} />, label: "Extensions" },
  { id: "examples", icon: <Icon icon={IconNames.CUBE} size={20} />, label: "范例" },
]

const tabs = [
  { id: "csv", label: "data.csv", render: () => <CsvEditor /> },
  { id: "showcase", label: "Blueprint Showcase", render: () => <ComponentShowcase /> },
  { id: "icons", label: "Icons", render: () => <IconShowcase /> },
]

function App() {
  return (
    <ThemeProvider>
      <CsvProvider>
        <HotkeysProvider>
        <AppLayout
          activities={activities}
          sidePanels={sidePanels}
          tabs={tabs}
          propertiesPanel={(activeId) =>
            activeId === "csv"
              ? { id: "csv-prop", label: "属性", render: () => <CsvProperties /> }
              : undefined
          }
        />
        </HotkeysProvider>
      </CsvProvider>
    </ThemeProvider>
  )
}

export default App
