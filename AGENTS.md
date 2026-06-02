# 项目记忆

## 技术栈
- React 19 + Vite 8 + TypeScript 6
- Blueprint 6 (`@blueprintjs/core`, `@blueprintjs/icons`, `@blueprintjs/table`)
- Monaco Editor (`@monaco-editor/react`)
- CSV 解析: `papaparse`

## 布局命名 (沟通名称 / 组件名 / CSS 类名)

| 名称 | 组件 | CSS 类 | 说明 |
|---|---|---|---|
| 标题栏 | `TitleBar` | `.hdr` | 顶部标题 |
| 导航栏 | `ActivityBar` | `.nav` | 左侧图标列 |
| 菜单栏 | `SiderBar` | `.menu` | 导航栏右侧面板 |
| 编辑区 | `EditorArea` | `.editor` | 中央 tab + 编辑器 |
| 属性栏 | `PropertiesBar` | `.right` | 右侧边栏 |
| 底部面板 | `Panel` | `.panel` | 底部终端区 |
| 状态栏 | `StatusBar` | `.status` | 底部状态条 |

## 架构
```
src/
├── App.tsx                    # 主入口: ThemeProvider → HotkeysProvider → AppLayout
├── layout/
│   ├── AppLayout.tsx          # 布局外壳 (hdr/nav/menu/editor/right/panel/status)
│   ├── AppLayout.css          # 布局样式 (所有类名: hdr/nav/menu/editor/right/panel/status)
│   ├── blueprintOverrides.css # BP6 组件颜色覆盖 (无作用域前缀)
│   ├── TitleBar.tsx           # 标题栏 (.hdr)
│   ├── ActivityBar.tsx        # 导航栏 (.nav)
│   ├── SiderBar.tsx           # 菜单栏 (.menu) — 可拖拽缩放
│   ├── PropertiesBar.tsx      # 属性栏 (.right) — 可拖拽缩放, 有关闭按钮
│   ├── EditorArea.tsx         # 编辑区 (.editor)
│   ├── Panel.tsx              # 底部面板 (.panel)
│   └── StatusBar.tsx          # 状态栏 (.status)
├── pages/
│   ├── CsvEditor.tsx          # CSV 编辑器 (Monaco + Blueprint Table2)
│   ├── ComponentShowcase.tsx  # Blueprint 6 组件展示
│   └── IconShowcase.tsx       # Blueprint 图标展示 (自动分组)
├── components/
│   └── FileTree.tsx           # 文件树组件 (TreeNode 类型 + projectTreeData)
├── config/
│   └── sidePanels.tsx         # 侧栏面板注册表 (files/search/source-control/extensions)
├── hooks/
│   └── useSidebarResize.ts    # useSidebarResize (左栏) + useRightResize (右栏)
├── theme/
│   ├── ThemeContext.tsx        # 主题上下文 (dark/light 切换, 自动管理 html.light)
│   └── themes.css             # :root / :root.light 所有颜色变量
├── main.tsx                   # 入口, 加载 BP6 CSS + themes.css
└── index.css                  # 全局 reset
```

## 设计决策
- **根元素类名**: 根 div 直接使用 `bp6-dark` 或 `bp6-light light`，没有多余的作用域类名
- **颜色变量**: 所有颜色定义在 `:root` (暗色) / `:root.light` (亮色) → Portal 组件 (Dialog/Drawer) 可通过 `var()` 访问
- **暗色模式**: 根 div 加 `bp6-dark` 类 → BP6 内置暗色样式; PortalProvider 为 Portal 容器加 `bp6-dark`
- **亮色模式**: `html` 加 `.light` 类 (ThemeContext useEffect); PortalProvider 不加 `bp6-dark`, BP6 默认亮色样式
- **Dialog/Drawer**: 用 `.bp6-dark .bp6-dialog` 全局选择器覆盖 (Portal 作用域问题)
- **CSV 数据同步**: `csvDataRef` (useRef) 避免闭包过期; `cellRendererDependencies` 强制 Table2 重渲染
- **按钮焦点**: `button:focus { outline: none !important }` 移除蓝色外框
- **拖拽缩放**: `useSidebarResize` 左栏 (手柄在右侧, `+clientX`); `useRightResize` 右栏 (手柄在左侧, `-clientX`)
- **CSS 覆盖文件**: 所有 BP6 组件颜色覆盖集中在 `blueprintOverrides.css`，无作用域前缀，因 SPA 自然隔离

## 已修复的问题
1. `bp5-` → `bp6-` 前缀
2. 对话框/抽屉背景透明的 Portal 作用域问题
3. Slider 标尺密度 (`labelStepSize=10`)
4. `<pre>` 不能放在 `<p>` 内
5. 导航栏 active 指示器 `top/bottom` 改为 `1px`
6. `useHotkeys()` 需要 `<HotkeysProvider>` 包裹
7. 图标名称需使用 `IconNames` 常量 (不是大写字符串)
8. `replaceAll` 误伤 `.app-body` → `-body` (删 `.app` 时 class 名被截断)

## 备忘录
- 所有 Blueprint 图标用 `<Icon icon={IconNames.XXX} />` (从 `@blueprintjs/icons` 导入)
- `MultiSlider.Handle` 使用 `onChange` 属性 (不是 `onChangeBefore`)
- `CompoundTag` 右侧内容用 `children` (不是 `rightContent`)
- `OverlayToaster.create()` 返回 `Promise<Toaster>`, 需要用 `useRef` + `useEffect` 获取
- `Breadcrumbs` 从 `@blueprintjs/core/lib/esm/components/breadcrumbs/breadcrumbs` 导入 (BP6.15 顶部 re-export 缺失)
- `Tab` 用 `panel` 属性代替 `TabPanel` 组件
- IconShowcase 自动分组: 按 `IconNames` 枚举名前缀归为 Actions/Arrows/Files/UI/Editor/Graph 等
- 属性栏 (`PropertiesBar`) 通过 `AppLayout` 的 `propertiesPanel` prop 传入，可选中不传则不显示
