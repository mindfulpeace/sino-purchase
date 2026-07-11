# MUI（Material UI）v9

> **类型**: entity
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/lib-mui-v9]]
> **版本**: @mui/material / @mui/icons-material = 9.2.0

## 摘要
Material UI v9 是 React 的组件库主版本，最大变化是"slotProps 化""清除 system props""语义/可访问性增强"。本项目已全面采用 v9 写法（已迁移自 Blueprint 6）。

## 详情

### 安装
`npm i @mui/material @mui/icons-material @emotion/react @emotion/styled`

### 关键迁移点（v9）
- 表单组件 `InputProps`/`InputLabelProps`/`FormHelperTextProps`/`SelectProps` 全部移除 → 统一用 `slotProps`
- `GridLegacy` 移除；`Grid` 用 `size={{ xs: 12, sm: 6 }}`，不再有 `item` prop
- `Box`/`Grid`/`Stack`/`Typography` 的 system props（`mt`/`color`）移除 → 改用 `sx`
- 主题 `MuiTouchRipple` 类型移除 → 改用全局 CSS `.MuiTouchRipple-*`
- `Typography paragraph` 移除 → `sx={{ marginBottom: '16px' }}`
- `Dialog` `disableEscapeKeyDown` 移除 → `onClose` 中判断 `reason !== 'escapeKeyDown'`
- `Slider` 改用 pointer events，`onMouseDown` 防拖拽失效 → 改用 `onPointerDown`

### 本项目用法
- 通用组件封装在 `apps/sino-purchase-v2/src/components/ui/`，业务代码 import 路径不变
- 真实示例（`components.tsx`）：
  ```tsx
  slotProps={{ input: {}, inputLabel: { shrink: true } }}        // 日期类字段
  slotProps={{ input: { sx: { fontSize: 12, fontFamily: 'inherit' } } }}
  ```
- 图标：`<Icon icon={IconNames.XXX} />`，底层来自 `@mui/icons-material`

## 关联
- 相关实体: [[entities/product-react]], [[entities/product-emotion]]
- 参见: [[topics/topic-design-system]]

## 引用来源
- [1] [[raw/lib-mui-v9]] — 官方 v9 迁移文档（联网抓取）
- [2] 官方文档 https://mui.com/material-ui/migration/upgrade-to-v9/

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/lib-mui-v9]]
