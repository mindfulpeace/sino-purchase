# 原始素材：MUI v9 迁移要点

> 来源：https://mui.com/material-ui/migration/upgrade-to-v9/ （联网抓取，2026-07-08）
> 可信度：✅ 已核验（官方迁移文档）

## 主旨
v9 最大主题是 **"slotProps 化"**（统一插槽 API）、**"system props 清除"**、**"语义/可访问性增强"**。移除了所有早期 deprecated API。官方提供 codemod：`npx @mui/codemod@latest deprecations/<name> <path>`

## 表单类（TextField / Select / Autocomplete）
- 移除 `InputProps` / `inputProps` / `SelectProps` / `InputLabelProps` / `FormHelperTextProps` → 统一 `slotProps`
```diff
 <TextField
-  InputProps={...} InputLabelProps={...} FormHelperTextProps={...}
+  slotProps={{ input: {...}, inputLabel: {...}, formHelperText: {...} }}
 />
```
- Autocomplete 移除 `ChipProps` / `componentsProps` / `ListboxComponent` / `PaperComponent` / `PopperComponent` / `renderTags` → 改用 `slots` / `slotProps` / `renderValue`
- Select 的 `MenuProps` 内部 `PaperProps` / `MenuListProps` → `slotProps.paper` / `slotProps.list`

## Grid
- `GridLegacy` 彻底移除，改用 `Grid`
- 不再需要 `item`；`xs/sm/md/lg/xl` → `size` prop
```diff
-<Grid item xs={12} sm={6}>
+<Grid size={{ xs: 12, sm: 6 }}>
```

## 主题 / styleOverrides
- 移除 `MuiTouchRipple` 主题类型 → 改用全局 CSS `.MuiTouchRipple-*`
- 大量 CSS 类重命名；主题用 `variants` 数组替代原 class key
- `Typography` 移除 `paragraph` prop → 改用 `sx={{ marginBottom: '16px' }}`

## System Props 清除
- 从 `Box` / `Grid` / `Stack` / `Link` / `Typography` 等移除 system props（`mt` / `color` 等）→ 改用 `sx`
- Codemod：`npx @mui/codemod@latest v9.0.0/system-props <path>`

## 其他 Breaking
- Dialog/Modal：`disableEscapeKeyDown` 移除，需在 `onClose` 中判断 `reason !== 'escapeKeyDown'`
- Slider：改用 pointer events，`onMouseDown` 防拖拽失效 → 用 `onPointerDown`
- Material Icons：23 个 `*Outline` 副本移除，改 `*Outlined`
- Checkbox/Radio/Switch：`inputProps` / `inputRef` → `slotProps.input`（`.ref`）

## 本项目现状
- 主应用已使用 v9 写法：见 `apps/sino-purchase-v2/src/components/ui/components.tsx` 中 `slotProps={{ input: {...}, inputLabel: { shrink: true } }}`
- `AGENTS.md` 已记录 `MUI v9 已移除 InputLabelProps，改用 slotProps.inputLabel`
