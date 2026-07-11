# 设计系统与主题（sino-purchase-v2）

> **类型**: topic
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/project-experience]] + 专家编译
> **可信度**: ✅ 设计决策来自 AGENTS.md；🟡 视觉风格为专家综合

## 摘要
本项目 UI 走"Linear 极简高效 + Neo-Brutalism 视觉"融合路线：加粗边框、高饱和纯色、偏移阴影，**禁用渐变/玻璃拟态**，自然有机配色。主题单一来源是 `src/theme/theme.ts` 的 `designTokens(mode)` + `buildMuiTheme(mode)`。

## 详情

### 设计令牌单一来源
- 所有颜色定义在 `:root`（暗色）/ `:root.theme-light`（亮色）
- MUI 经 `createTheme` + `sx` 访问；语义色放 `theme.palette.task.*`
- 通用组件默认样式下沉到 MUI 主题 `components` 与 `MuiCssBaseline.styleOverrides`
- 组件内用 `sx` 引用 `theme.palette.task.*` 语义色

### 主题切换
- `ThemeProvider > SheetsProvider > DockLayout` 嵌套
- 暗色：`palette.mode: 'dark'`；亮色：`html` 加 `.theme-light` class（ThemeContext useEffect）
- dockview 暗色用 `themeAbyss`，亮色用 `themeLight`（layout-dock 内 `theme === 'dark' ? themeAbyss : themeLight`）

### dockview 视觉微调
- tab 高度：`--dv-tabs-and-actions-container-height: 28px`（默认 35）
- 面板文字：`.dv-content-container` opacity 0.7(暗)/0.85(亮)，标题 1.0
- 焦点轮廓：`--dv-paneview-active-outline-color: transparent`（禁用蓝色轮廓）
- 隐藏 tab 浮动/最大化/最小化按钮：`.dv-tab .dv-default-tab-action { display: none }`

### 打印
- `@media print` 隐藏 chrome（tabs/headers/resize-handles）+ `.layout-dock-left/center/bottom`，重置 dockview 内部为静态流，仅 `.layout-dock-right` 的 printable 内容填满页面
- 打印字体 14px；`.editor { display: none }`

> ⚠️ 矛盾标注：AGENTS.md 早期写"禁用渐变、禁用玻璃拟态"，但历史修复清单第 2 条曾出现"对话框/抽屉背景透明 Portal"——属废弃方案（MUI Dialog 自带 Portal），当前以主题令牌为准，勿复用透明 Portal。

## 关联
- 相关实体: [[entities/product-mui]], [[entities/product-dockview]], [[entities/product-emotion]]
- 参见: [[topics/topic-project-architecture]], [[topics/topic-pitfalls-guide]], [[concepts/concept-erp-ux-patterns]]

## 引用来源
- [1] [[raw/project-experience]] — AGENTS.md 设计决策
- [2] [[raw/lib-dockview-v66]] — dockview 主题 CSS 变量

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/project-experience]] + [[raw/lib-dockview-v66]]
