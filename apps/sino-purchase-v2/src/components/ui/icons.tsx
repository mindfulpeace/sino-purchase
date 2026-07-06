import type { ReactNode } from "react"
import ShoppingCart from "@mui/icons-material/ShoppingCartOutlined"
import Dashboard from "@mui/icons-material/DashboardOutlined"
import MonetizationOn from "@mui/icons-material/MonetizationOnOutlined"
import CurrencyExchange from "@mui/icons-material/CurrencyExchangeOutlined"
import GridView from "@mui/icons-material/GridViewOutlined"
import Login from "@mui/icons-material/Login"
import Logout from "@mui/icons-material/Logout"
import Person from "@mui/icons-material/PersonOutlined"
import Tune from "@mui/icons-material/TuneOutlined"
import Settings from "@mui/icons-material/SettingsOutlined"
import Delete from "@mui/icons-material/DeleteOutlined"
import NoteAdd from "@mui/icons-material/NoteAddOutlined"
import FileDownload from "@mui/icons-material/FileDownloadOutlined"
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp"
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown"
import Search from "@mui/icons-material/SearchOutlined"
import Refresh from "@mui/icons-material/RefreshOutlined"
import Print from "@mui/icons-material/PrintOutlined"
import OpenInNew from "@mui/icons-material/OpenInNewOutlined"
import Check from "@mui/icons-material/CheckOutlined"
import Add from "@mui/icons-material/AddOutlined"
import Edit from "@mui/icons-material/EditOutlined"
import Close from "@mui/icons-material/CloseOutlined"
import Storage from "@mui/icons-material/StorageOutlined"
import ContentPaste from "@mui/icons-material/ContentPasteOutlined"
import FileUpload from "@mui/icons-material/FileUploadOutlined"
import Brightness4 from "@mui/icons-material/Brightness4Outlined"
import type { SvgIconProps } from "@mui/material/SvgIcon"

const muiIcons: Record<string, React.ComponentType<SvgIconProps>> = {
  SHOPPING_CART: ShoppingCart,
  LAYERS: Dashboard,
  DOLLAR: MonetizationOn,
  EXCHANGE: CurrencyExchange,
  GRID_VIEW: GridView,
  LOG_IN: Login,
  LOG_OUT: Logout,
  PERSON: Person,
  PROPERTIES: Tune,
  COG: Settings,
  TRASH: Delete,
  NEW_OBJECT: NoteAdd,
  IMPORT: FileDownload,
  CHEVRON_UP: KeyboardArrowUp,
  CHEVRON_DOWN: KeyboardArrowDown,
  SEARCH: Search,
  REFRESH: Refresh,
  PRINT: Print,
  SHARE: OpenInNew,
  TICK: Check,
  BLANK: () => null,
  PLUS: Add,
  EDIT: Edit,
  CROSS: Close,
  DATABASE: Storage,
  CLIPBOARD: ContentPaste,
  EXPORT: FileUpload,
  THEME: Brightness4,
}

export type IconName = keyof typeof muiIcons

export const IconNames: Record<IconName, IconName> = (() => {
  const o = {} as Record<string, IconName>
  for (const k of Object.keys(muiIcons)) o[k] = k
  return o
})()

export function Icon({ icon, size = 16, style, className }: {
  icon: IconName
  size?: number
  style?: React.CSSProperties
  className?: string
}) {
  const C = muiIcons[icon]
  if (!C) return null
  return <C sx={{ fontSize: size, flexShrink: 0, ...style }} className={className} />
}

export function iconToNode(name: string): ReactNode {
  const upper = name.toUpperCase()
  if (upper in muiIcons) return <Icon icon={upper as IconName} size={14} />
  return <Icon icon="BLANK" size={14} />
}
