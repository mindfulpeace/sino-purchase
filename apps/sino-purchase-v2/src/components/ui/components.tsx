import { type ReactNode, type CSSProperties, type MouseEvent, Children, forwardRef } from "react"
import { iconToNode, type IconName } from "./icons"
import MuiButton from "@mui/material/Button"
import MuiTextField from "@mui/material/TextField"
import MuiSelect from "@mui/material/Select"
import MuiMenuItem from "@mui/material/MenuItem"
import MuiSwitch from "@mui/material/Switch"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import MuiChip from "@mui/material/Chip"
import MuiStack from "@mui/material/Stack"
import MuiBox from "@mui/material/Box"
import MuiTypography from "@mui/material/Typography"
import MuiRadioGroup from "@mui/material/RadioGroup"
import MuiRadio from "@mui/material/Radio"
import MuiFormControl from "@mui/material/FormControl"
import MuiInputLabel from "@mui/material/InputLabel"
import MuiTable from "@mui/material/Table"
import MuiCard from "@mui/material/Card"
import MuiCardContent from "@mui/material/CardContent"
import MuiCircularProgress from "@mui/material/CircularProgress"
import MuiTooltip from "@mui/material/Tooltip"
import MuiDialog from "@mui/material/Dialog"
import MuiDialogTitle from "@mui/material/DialogTitle"
import MuiDialogContent from "@mui/material/DialogContent"
import MuiDialogActions from "@mui/material/DialogActions"
import MuiCollapse from "@mui/material/Collapse"
import MuiAutocomplete from "@mui/material/Autocomplete"
import MuiMenuList from "@mui/material/MenuList"
import MuiToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import MuiToggleButton from "@mui/material/ToggleButton"
import MuiCheckbox from "@mui/material/Checkbox"
import MuiAccordion from "@mui/material/Accordion"
import MuiAccordionSummary from "@mui/material/AccordionSummary"
import MuiAccordionDetails from "@mui/material/AccordionDetails"
import MuiTabs from "@mui/material/Tabs"
import MuiTab from "@mui/material/Tab"
import MuiSkeleton from "@mui/material/Skeleton"

type Intent = "primary" | "danger" | "success" | "warning" | "none"

const muiColor: Record<string, "primary" | "error" | "success" | "warning"> = {
  primary: "primary",
  danger: "error",
  success: "success",
  warning: "warning",
}

/* ================================================================
   Button
   ================================================================ */

interface ButtonProps {
  children?: ReactNode
  icon?: IconName | ReactNode
  intent?: Intent
  variant?: "minimal" | "outlined" | "contained"
  size?: "small"
  active?: boolean
  small?: boolean
  minimal?: boolean
  disabled?: boolean
  fill?: boolean
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  style?: CSSProperties
  className?: string
  title?: string
  text?: string
}

export function Button({ children, icon, intent, variant, size, active, small, minimal, disabled, fill, onClick, style, className, title, text }: ButtonProps) {
  const displayText = text ?? children
  const iconNode = (typeof icon === "string" ? iconToNode(icon) : icon) as ReactNode
  const isSmall = small || size === "small"

  return (
    <MuiButton
      startIcon={iconNode ? <>{iconNode}</> : undefined}
      color={intent ? (muiColor[intent] ?? "primary") : undefined}
      variant={minimal || variant === "minimal" ? "text" : variant === "outlined" ? "outlined" : variant === "contained" || active ? "contained" : undefined}
      size={isSmall ? "small" : "medium"}
      disabled={disabled}
      fullWidth={fill}
      onClick={onClick as any}
      title={title}
      className={className}
      sx={{
        textTransform: "none",
        minWidth: iconNode && !displayText ? "auto" : undefined,
        fontSize: isSmall ? 12 : 13,
        ...style as any,
      }}
    >
      {displayText}
    </MuiButton>
  )
}

/* ================================================================
   ButtonGroup (accepts ignored BP props for backward compat)
   ================================================================ */

interface ButtonGroupProps {
  children?: ReactNode
  minimal?: boolean
  variant?: string
  size?: string
  style?: CSSProperties
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export function ButtonGroup({ children, style, className, onClick }: ButtonGroupProps) {
  return (
    <MuiStack direction="row" spacing={0.25} className={className} onClick={onClick} sx={style as any}>
      {children}
    </MuiStack>
  )
}

/* ================================================================
   InputGroup
   ================================================================ */

interface InputGroupProps {
  id?: string
  value?: string
  label?: string
  placeholder?: string
  type?: string
  variant?: "standard" | "outlined"
  disabled?: boolean
  readOnly?: boolean
  fill?: boolean
  style?: CSSProperties
  className?: string
  inputRef?: React.Ref<HTMLInputElement>
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function InputGroup({ id, value, label, placeholder, type, variant, disabled, readOnly, fill, style, className, inputRef, onChange, onKeyDown }: InputGroupProps) {
  return (
    <MuiTextField
      id={id}
      label={label}
      value={value ?? ""}
      placeholder={placeholder}
      type={type ?? "text"}
      disabled={disabled ?? readOnly}
      size="small"
      variant={variant ?? "outlined"}
      onChange={onChange}
      onKeyDown={onKeyDown}
      inputRef={inputRef}
      className={className}
      fullWidth={fill}
      slotProps={{ input: {}, ...(type === "date" ? { inputLabel: { shrink: true } } : {}) }}
      sx={{
        minWidth: 0,
        "& .MuiInputBase-root": { height: 24, padding: 0 } as any,
        "& .MuiOutlinedInput-input": { padding: "2px 8px", height: 24 } as any,
        "& .MuiInput-input": { padding: "2px 8px" } as any,
        "& .MuiOutlinedInput-root": { padding: 0 } as any,
        ...style as any,
      }}
    />
  )
}

/* ================================================================
   NumericInput
   ================================================================ */

interface NumericInputProps {
  id?: string
  value?: string | number
  label?: string
  placeholder?: string
  variant?: "standard" | "outlined"
  min?: number
  step?: number
  disabled?: boolean
  style?: CSSProperties
  onValueChange?: (v: number) => void
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

export function NumericInput({ id, value, label, placeholder, variant, min, step, disabled, style, onValueChange, onChange }: NumericInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) { onChange(e); return }
    if (!onValueChange) return
    const v = parseFloat(e.target.value)
    if (!isNaN(v)) onValueChange(v)
  }
  return (
    <MuiTextField
      id={id}
      label={label}
      value={value ?? ""}
      placeholder={placeholder}
      type="number"
      disabled={disabled}
      size="small"
      variant={variant ?? "outlined"}
      onChange={handleChange}
      slotProps={{
        htmlInput: { min, step },
        input: {},
      }}
      sx={{
        minWidth: 0,
        "& .MuiInputBase-root": { height: 24, padding: 0 } as any,
        "& .MuiOutlinedInput-input": { padding: "2px 6px", height: 24 } as any,
        "& .MuiInput-input": { padding: "2px 6px" } as any,
        "& .MuiOutlinedInput-root": { padding: 0 } as any,
        "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": { display: "none" },
        "& input[type=number]": { MozAppearance: "textfield" },
        ...style as any,
      }}
    />
  )
}

/* ================================================================
   TextArea
   ================================================================ */

interface TextAreaProps {
  value?: string
  placeholder?: string
  rows?: number
  large?: boolean
  style?: CSSProperties
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export function TextArea({ value, placeholder, rows, style, onChange }: TextAreaProps) {
  return (
    <MuiTextField
      value={value ?? ""}
      placeholder={placeholder}
      multiline
      minRows={rows ?? 3}
      size="small"
      onChange={onChange}
      slotProps={{ input: { sx: { fontSize: 12, fontFamily: "inherit" } as any } }}
      sx={{ ...style as any }}
    />
  )
}

/* ================================================================
   Switch
   ================================================================ */

interface SwitchProps {
  checked?: boolean
  label?: string
  disabled?: boolean
  onChange?: (e: { currentTarget: { checked: boolean } }) => void
}

export function Switch({ checked, label, disabled, onChange }: SwitchProps) {
  const ctrl = (
    <MuiSwitch
      checked={checked}
      disabled={disabled}
      size="small"
      onChange={(_, v) => onChange?.({ currentTarget: { checked: v } })}
    />
  )
  if (!label) return ctrl
  return <MuiFormControlLabel control={ctrl} label={label} />
}

/* ================================================================
   Tag
   ================================================================ */

interface TagProps {
  children?: ReactNode
  minimal?: boolean
  intent?: Intent
  style?: CSSProperties
}

export function Tag({ children, minimal, intent, style }: TagProps) {
  return (
    <MuiChip
      label={children}
      size="small"
      variant={minimal ? "outlined" : "filled"}
      color={intent && intent !== "none" ? muiColor[intent] : "default"}
      sx={{
        height: 18,
        fontSize: 10,
        "& .MuiChip-label": { px: 0.75, py: 0 },
        ...style as any,
      }}
    />
  )
}

/* ================================================================
   ControlGroup
   ================================================================ */

export function ControlGroup({ children, fill }: { children?: ReactNode; fill?: boolean }) {
  return <MuiStack direction="row" spacing={0.5} sx={fill ? { flex: 1 } : undefined}>{children}</MuiStack>
}

/* ================================================================
   Text / H3 / H4
   ================================================================ */

export function Text({ children, style, className }: { children?: ReactNode; style?: CSSProperties; className?: string }) {
  return <MuiTypography component="span" sx={style as any} className={className}>{children}</MuiTypography>
}

export function H3({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <MuiTypography variant="h6" sx={{ fontSize: 16, fontWeight: 600, m: 0, ...style as any }}>{children}</MuiTypography>
}

export function H4({ children, style, className }: { children?: ReactNode; style?: CSSProperties; className?: string }) {
  return <MuiTypography variant="subtitle1" className={className} sx={{ fontSize: 14, fontWeight: 600, m: 0, ...style as any }}>{children}</MuiTypography>
}

/* ================================================================
   RadioGroup / Radio
   ================================================================ */

interface RadioProps { label: string; value: string }

interface RadioGroupProps {
  children?: ReactNode
  inline?: boolean
  selectedValue?: string
  style?: CSSProperties
  onChange?: (e: { currentTarget: { value: string } }) => void
}

export function RadioGroup({ children, inline, selectedValue, style, onChange }: RadioGroupProps) {
  const items = Children.toArray(children).filter(
    (c): c is React.ReactElement<RadioProps> =>
      typeof c === "object" && c !== null && "props" in c && typeof (c.props as any)?.value === "string"
  )
  return (
    <MuiFormControl sx={style as any}>
      <MuiRadioGroup
        row={inline}
        value={selectedValue ?? ""}
        onChange={(_, v) => onChange?.({ currentTarget: { value: v } })}
      >
        {items.map((c) => (
          <MuiFormControlLabel
            key={c.props.value}
            value={c.props.value}
            control={<MuiRadio size="small" />}
            label={c.props.label}
            sx={{ fontSize: 12 }}
          />
        ))}
      </MuiRadioGroup>
    </MuiFormControl>
  )
}

export function Radio(_: RadioProps) { return null }

/* ================================================================
   HTMLTable (accepts ignored BP props for backward compat)
   ================================================================ */

export function HTMLTable({ children, style }: {
  children?: ReactNode
  compact?: boolean
  striped?: boolean
  style?: CSSProperties
}) {
  return <MuiTable sx={{ borderCollapse: "collapse", fontSize: 12, ...style as any }}>{children}</MuiTable>
}

/* ================================================================
   Card
   ================================================================ */

export function Card({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <MuiCard variant="outlined" sx={{ borderRadius: 1.5, ...style as any }}>
      <MuiCardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        {children}
      </MuiCardContent>
    </MuiCard>
  )
}

/* ================================================================
   NonIdealState
   ================================================================ */

export function NonIdealState({ icon, title, action }: { icon?: ReactNode; title?: string; action?: ReactNode }) {
  return (
    <MuiStack spacing={1.5} sx={{ p: 6, color: "text.secondary", alignItems: "center" }}>
      {icon}
      {title && <MuiTypography sx={{ fontSize: 14, fontWeight: 500 }}>{title}</MuiTypography>}
      {action}
    </MuiStack>
  )
}

/* ================================================================
   Spinner
   ================================================================ */

export function Spinner({ size = 20 }: { size?: number }) {
  return <MuiCircularProgress size={size} />
}

/* ================================================================
   Tooltip
   ================================================================ */

export function Tooltip({ content, children }: { content?: string; children: ReactNode }) {
  if (!content) return <>{children}</>
  return <MuiTooltip title={content}><span>{children}</span></MuiTooltip>
}

/* ================================================================
   Dialog
   ================================================================ */

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  style?: CSSProperties
  children?: ReactNode
}

export function Dialog({ isOpen, onClose, title, style, children }: DialogProps) {
  return (
    <MuiDialog open={isOpen} onClose={onClose} maxWidth={false} sx={{ "& .MuiDialog-paper": style as any }}>
      {title && <MuiDialogTitle sx={{ fontSize: 14, fontWeight: 600, py: 1.5, px: 2 }}>{title}</MuiDialogTitle>}
      <MuiDialogContent sx={{ p: 0 }}>
        {children}
      </MuiDialogContent>
    </MuiDialog>
  )
}

export const Classes = {
  DIALOG_BODY: "ui-dialog-body",
}

/* ================================================================
   Alert
   ================================================================ */

interface AlertProps {
  isOpen: boolean
  onClose: () => void
  cancelButtonText?: string
  confirmButtonText?: string
  intent?: Intent
  canEscapeKeyCancel?: boolean
  canOutsideClickCancel?: boolean
  onConfirm: () => void
  children?: ReactNode
}

export function Alert({ isOpen, onClose, cancelButtonText, confirmButtonText, intent, canEscapeKeyCancel, canOutsideClickCancel, onConfirm, children }: AlertProps) {
  return (
    <MuiDialog
      open={isOpen}
      onClose={(_: any, reason: string) => {
        if (reason === "escapeKeyDown" && !canEscapeKeyCancel) return
        if (reason === "backdropClick" && !canOutsideClickCancel) return
        onClose()
      }}
      maxWidth="xs"
    >
      <MuiDialogContent sx={{ pt: 2.5, pb: 0 }}>{children}</MuiDialogContent>
      <MuiDialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose}>{cancelButtonText ?? "取消"}</Button>
        <Button intent={intent ?? "danger"} onClick={onConfirm}>{confirmButtonText ?? "确认"}</Button>
      </MuiDialogActions>
    </MuiDialog>
  )
}

/* ================================================================
   Collapse
   ================================================================ */

export function Collapse({ isOpen, keepChildrenMounted, children }: { isOpen: boolean; keepChildrenMounted?: boolean; children?: ReactNode }) {
  return (
    <MuiCollapse in={isOpen} unmountOnExit={!keepChildrenMounted}>
      {children}
    </MuiCollapse>
  )
}

/* ================================================================
   MenuItem (MUI MenuItem wrapper; BP-style text/icon API)
   ================================================================ */

interface MenuItemProps {
  active?: boolean
  icon?: ReactNode
  text?: string
  label?: string
  selected?: boolean
  disabled?: boolean
  shouldDismissPopover?: boolean
  onClick?: (e?: React.MouseEvent) => void
}

export function MenuItem({ active, icon, text, label, selected, disabled, onClick }: MenuItemProps) {
  return (
    <MuiMenuItem
      selected={selected}
      disabled={disabled}
      onClick={(e) => { onClick?.(e as any) }}
      sx={{
        fontSize: 12,
        gap: 1,
        minHeight: 26,
        bgcolor: active ? "action.hover" : undefined,
      }}
    >
      <span style={{ width: 16, display: "inline-flex", justifyContent: "center", flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{text}</span>
      {label && <MuiTypography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{label}</MuiTypography>}
    </MuiMenuItem>
  )
}

/* ================================================================
   MultiSelect
   ================================================================ */

interface MultiSelectProps {
  items: string[]
  selectedItems: string[]
  onItemSelect: (item: string) => void
  tagRenderer: (item: string) => string
  tagInputProps: {
    onRemove: (item: string) => void
    placeholder?: string
  }
  itemRenderer: (item: string, handlers: { handleClick: () => void }) => ReactNode
  popoverProps?: { matchTargetWidth?: boolean }
  noResults?: ReactNode
  style?: CSSProperties
}

export function MultiSelect({ items, selectedItems, onItemSelect, tagRenderer, tagInputProps, itemRenderer, noResults, style }: MultiSelectProps) {
  const handleChange = (_: any, newVal: string[]) => {
    const added = newVal.find((v: string) => !selectedItems.includes(v))
    const removed = selectedItems.find((v) => !newVal.includes(v))
    if (added) onItemSelect(added)
    if (removed) tagInputProps.onRemove(removed)
  }

  // MUI v9 changed renderInput/renderTags API — use type assertion for compat
  const AutocompleteAny = MuiAutocomplete as any

  return (
    <AutocompleteAny
      multiple
      disableCloseOnSelect
      options={items}
      value={selectedItems}
      onChange={handleChange}
      renderInput={(params: any) => (
        <MuiTextField
          {...params}
          size="small"
          placeholder={tagInputProps.placeholder ?? "选择..."}
          sx={{ "& .MuiInputBase-root": { fontSize: 11, fontFamily: "inherit" }, ...(style as any) }}
        />
      )}
      renderTags={(value: string[], getTagProps: any) =>
        value.map((item: string, index: number) => {
          const { key, ...rest } = getTagProps({ index })
          return (
            <MuiChip
              key={key}
              label={tagRenderer(item)}
              size="small"
              {...rest}
              sx={{ height: 18, fontSize: 10, "& .MuiChip-label": { px: 0.5 } }}
            />
          )
        })
      }
      renderOption={(props: any, option: string) => {
        const { key, ...rest } = props
        return (
          <li key={key} {...rest}>
            <MuiMenuList disablePadding>
              {itemRenderer(option, { handleClick: () => onItemSelect(option) })}
            </MuiMenuList>
          </li>
        )
      }}
      noOptionsText={noResults}
      isOptionEqualToValue={(o: string, v: string) => o === v}
      size="small"
    />
  )
}

/* ================================================================
   Select (MUI-recommended; FormControl + MenuItem, not native <option>)
   ================================================================ */

interface SelectOption {
  value: string
  label: string
  color?: string
}

interface SelectProps {
  id?: string
  value?: string
  options: SelectOption[]
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  variant?: "standard" | "outlined"
  disabled?: boolean
  style?: CSSProperties
  className?: string
  allowCreate?: boolean
  onCreate?: () => void
}

export function Select({ id, value, options, onChange, placeholder, label, variant, disabled, style, className, allowCreate, onCreate }: SelectProps) {
  return (
    <MuiFormControl size="small" className={className} variant={variant ?? "outlined"} sx={{ minWidth: 0, ...style as any }}>
      {label && <MuiInputLabel shrink>{label}</MuiInputLabel>}
      <MuiSelect
        id={id}
        label={label}
        value={value ?? ""}
        displayEmpty
        disabled={disabled}
        onChange={(e) => {
          const v = e.target.value as string
          if (allowCreate && v === "__new__") { onCreate?.(); return }
          onChange?.(v)
        }}
        sx={{
          fontSize: 12,
          fontFamily: "inherit",
          height: 24,
          "& .MuiInputBase-root": { height: 24, padding: 0 } as any, "& .MuiOutlinedInput-root": { padding: 0 } as any,
          "& .MuiOutlinedInput-input": { padding: "2px 8px" } as any, "& .MuiSelect-select": { padding: "2px 8px" } as any,
          "& .MuiInput-input": { padding: "2px 8px" } as any,
          "& fieldset": { borderColor: "var(--border, #3a3a5a)" },
        }}
      >
        {placeholder !== undefined && <MuiMenuItem value="" sx={{ fontSize: 12 }}>{placeholder}</MuiMenuItem>}
        {options.map(o => (
          <MuiMenuItem
            key={o.value}
            value={o.value}
            sx={{ fontSize: 12, ...(o.color ? { color: o.color, "&.Mui-selected": { color: o.color } } : {}) }}
          >
            {o.label}
          </MuiMenuItem>
        ))}
        {allowCreate && <MuiMenuItem value="__new__" sx={{ fontSize: 12, color: "var(--accent, #4a90d9)" }}>+ 新建</MuiMenuItem>}
      </MuiSelect>
    </MuiFormControl>
  )
}

/* ================================================================
   ToggleButtonGroup / ToggleButton (MUI-recommended for filter toggles)
   ================================================================ */

interface ToggleButtonGroupProps {
  children?: ReactNode
  exclusive?: boolean
  value?: any
  size?: "small" | "medium"
  style?: CSSProperties
  className?: string
  onChange?: (value: any) => void
}

export function ToggleButtonGroup({ children, exclusive, value, size, style, className, onChange }: ToggleButtonGroupProps) {
  return (
    <MuiToggleButtonGroup
      exclusive={exclusive}
      value={value ?? (exclusive ? null : [])}
      size={size ?? "small"}
      onChange={(_, v) => onChange?.(v)}
      className={className}
      sx={{
        gap: 0,
        "& .MuiToggleButtonGroup-grouped": {
          fontSize: 11,
          px: 1,
          py: 0.25,
          minWidth: 28,
          borderColor: "var(--border, #3a3a5a) !important",
          color: "var(--text-dim, #858585)",
          "&.Mui-selected": {
            color: "var(--accent, #4a90d9)",
            bgcolor: "color-mix(in srgb, var(--accent, #4a90d9) 15%, transparent)",
          },
        },
        ...style as any,
      }}
    >
      {children}
    </MuiToggleButtonGroup>
  )
}

interface ToggleButtonProps {
  children?: ReactNode
  value: any
  style?: CSSProperties
  title?: string
}

export function ToggleButton({ children, value, style, title }: ToggleButtonProps) {
  return (
    <MuiToggleButton value={value} title={title} sx={style as any}>
      {children}
    </MuiToggleButton>
  )
}

/* ================================================================
   Stack / Box (MUI-recommended layout primitives)
   - Stack: flex flow (row/column) with `direction`/`spacing`
   - Box: generic styled container (replaces raw <div>)
   className is preserved so existing CSS layout rules still apply.
   ================================================================ */

export function Stack({ direction = "column", spacing, children, className, style, sx, alignItems, justifyContent, flexWrap, onClick }: {
  direction?: "row" | "column" | "row-reverse" | "column-reverse"
  spacing?: number
  children?: ReactNode
  className?: string
  style?: CSSProperties
  sx?: any
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline"
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly"
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse"
  onClick?: (e: React.MouseEvent) => void
}) {
  return (
    <MuiStack
      direction={direction}
      spacing={spacing}
      className={className}
      onClick={onClick}
      sx={{ ...style, alignItems, justifyContent, flexWrap, ...sx } as any}
    >
      {children}
    </MuiStack>
  )
}

export const Box = forwardRef<HTMLDivElement, {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  sx?: any
  onClick?: (e: React.MouseEvent) => void
  [key: `data-${string}`]: any
}>(function Box({ children, className, style, sx, onClick, ...rest }, ref) {
  return (
    <MuiBox ref={ref} className={className} onClick={onClick} sx={{ ...style, ...sx } as any} {...rest}>
      {children}
    </MuiBox>
  )
})

/* ================================================================
   Checkbox (MUI-recommended)
   ================================================================ */

interface CheckboxProps {
  checked?: boolean
  disabled?: boolean
  style?: CSSProperties
  onChange?: (checked: boolean) => void
}

export function Checkbox({ checked, disabled, style, onChange }: CheckboxProps) {
  return (
    <MuiCheckbox
      checked={checked}
      disabled={disabled}
      size="small"
      onChange={(_, v) => onChange?.(v)}
      sx={{
        p: 0.25,
        color: "var(--text-dim, #858585)",
        "&.Mui-checked": { color: "var(--accent, #4a90d9)" },
        ...style as any,
      }}
    />
  )
}

/* ================================================================
   DialogActions (MUI-recommended for dialog footers)
   ================================================================ */

export function DialogActions({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <MuiDialogActions sx={{ px: 2, py: 1.5, borderTop: "1px solid var(--border, #3a3a5a)", ...style as any }}>
      {children}
    </MuiDialogActions>
  )
}

/* ================================================================
   Accordion (MUI-recommended for expandable detail sections)
   ================================================================ */

export function Accordion({ expanded, onChange, children, style, className }: {
  expanded?: boolean
  onChange?: (e: React.SyntheticEvent, expanded: boolean) => void
  children?: ReactNode
  style?: CSSProperties
  className?: string
}) {
  return (
    <MuiAccordion
      expanded={expanded}
      onChange={onChange}
      disableGutters
      square
      className={className}
      sx={{ bgcolor: "transparent", "&:before": { display: "none" }, ...style as any }}
    >
      {(children ?? null) as any}
    </MuiAccordion>
  )
}

export function AccordionSummary({ children, expandIcon, style, className }: {
  children?: ReactNode
  expandIcon?: ReactNode
  style?: CSSProperties
  className?: string
}) {
  return (
    <MuiAccordionSummary
      expandIcon={expandIcon}
      className={className}
      sx={{
        minHeight: 0,
        px: 0.5,
        "&.Mui-expanded": { minHeight: 0 },
        "& .MuiAccordionSummary-content": { m: 0, alignItems: "center", width: "100%" },
        ...style as any,
      }}
    >
      {children}
    </MuiAccordionSummary>
  )
}

export function AccordionDetails({ children, style, className }: { children?: ReactNode; style?: CSSProperties; className?: string }) {
  return <MuiAccordionDetails className={className} sx={{ p: 0, ...style as any }}>{children}</MuiAccordionDetails>
}

/* ================================================================
   Tabs / Tab (MUI-recommended for tab switching)
   ================================================================ */

interface TabsProps {
  value: any
  onChange: (value: any) => void
  children: ReactNode
  style?: CSSProperties
  variant?: "standard" | "fullWidth"
}

export function Tabs({ value, onChange, children, style, variant }: TabsProps) {
  return (
    <MuiTabs
      value={value}
      onChange={(_, v) => onChange(v)}
      variant={variant}
      sx={{
        minHeight: 0,
        "& .MuiTab-root": { minHeight: 0, py: 0.5, fontSize: 12, textTransform: "none", color: "var(--text-dim, #858585)", fontWeight: 400 },
        "& .MuiTab-root.Mui-selected": { color: "var(--text-primary, #e6e6e6)", fontWeight: 600 },
        "& .MuiTabs-indicator": { backgroundColor: "var(--accent, #4a90d9)" },
        ...style as any,
      }}
    >
      {children}
    </MuiTabs>
  )
}

export function Tab(props: any) {
  const { value, label, icon, ...rest } = props
  return <MuiTab value={value} label={label} icon={icon} {...rest} />
}

/* ================================================================
   Skeleton (MUI-recommended loading placeholder)
   - replaces the old .sk*.css placeholder bars
   ================================================================ */

export function Skeleton({ width, height, variant, animation, className, style, sx }: {
  width?: number | string
  height?: number | string
  variant?: "text" | "rectangular" | "rounded" | "circular"
  animation?: "pulse" | "wave" | false
  className?: string
  style?: CSSProperties
  sx?: any
}) {
  return (
    <MuiSkeleton
      width={width}
      height={height}
      variant={variant ?? "rounded"}
      animation={animation ?? "pulse"}
      className={className}
      sx={{
        borderRadius: 2,
        bgcolor: "var(--dv-separator-border, var(--border))",
        ...style,
        ...sx,
      } as any}
    />
  )
}

export const UI_STYLES = ""

export type { Intent }
