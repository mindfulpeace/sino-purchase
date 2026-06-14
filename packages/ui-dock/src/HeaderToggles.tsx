import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { useDock } from "./DockLayout"

export function HeaderToggles() {
  const { leftVisible, setLeftVisible, rightVisible, setRightVisible, bottomVisible, setBottomVisible } = useDock()

  return (
    <>
      <button
        className="dv-titlebar-btn"
        title="切换左侧栏"
        onClick={() => setLeftVisible(!leftVisible)}
      >
        <Icon icon={leftVisible ? IconNames.ADD_COLUMN_LEFT : IconNames.REMOVE_COLUMN_LEFT} size={14} />
      </button>
      <button
        className="dv-titlebar-btn"
        title="切换面板"
        onClick={() => setBottomVisible(!bottomVisible)}
      >
        <Icon icon={bottomVisible ? IconNames.APPLICATION : IconNames.CHEVRON_UP} size={14} />
      </button>
      <button
        className="dv-titlebar-btn"
        title="切换右侧栏"
        onClick={() => setRightVisible(!rightVisible)}
      >
        <Icon icon={rightVisible ? IconNames.ADD_COLUMN_RIGHT : IconNames.REMOVE_COLUMN_RIGHT} size={14} />
      </button>
    </>
  )
}
