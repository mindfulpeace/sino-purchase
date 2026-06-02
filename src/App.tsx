import { HotkeysProvider, Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { ThemeProvider } from "./theme/ThemeContext"
import AppLayout from "./layout/AppLayout"
import CsvEditor from "./pages/CsvEditor"
import ComponentShowcase from "./pages/ComponentShowcase"
import IconShowcase from "./pages/IconShowcase"
import { sidePanels } from "./config/sidePanels"
import "./App.css"

const activities = [
  { id: "files", icon: <Icon icon={IconNames.FOLDER_OPEN} size={20} />, label: "Explorer" },
  { id: "search", icon: <Icon icon={IconNames.SEARCH} size={20} />, label: "Search" },
  { id: "source-control", icon: <Icon icon={IconNames.GIT_BRANCH} size={20} />, label: "Source Control" },
  { id: "extensions", icon: <Icon icon={IconNames.WIDGET} size={20} />, label: "Extensions" },
]

const tabs = [
  { id: "csv", label: "data.csv", render: () => <CsvEditor /> },
  { id: "showcase", label: "Blueprint Showcase", render: () => <ComponentShowcase /> },
  { id: "icons", label: "Icons", render: () => <IconShowcase /> },
]

function App() {
  return (
    <ThemeProvider>
      <HotkeysProvider>
      <AppLayout
        activities={activities}
        sidePanels={sidePanels}
        tabs={tabs}
        defaultTab="csv"
      />
      </HotkeysProvider>
    </ThemeProvider>
  )
}

export default App
