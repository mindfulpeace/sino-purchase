# 项目记忆

## 技术栈
- React 19 + Vite 8 + TypeScript 6
- Blueprint 6 (`@blueprintjs/core`, `@blueprintjs/icons`, `@blueprintjs/table`)
- Monaco Editor (`@monaco-editor/react`)
- CSV 解析: `papaparse`

## 架构
```
src/
├── App.tsx                 # 主入口: ThemeProvider → VscodeLayout
├── layout/
│   ├── VscodeLayout.tsx    # VS Code IDE 外壳 (标题栏/活动栏/侧栏/编辑区/面板/状态栏)
│   └── VscodeLayout.css    # 布局样式 + Blueprint 组件颜色覆盖
├── pages/
│   ├── CsvEditor.tsx       # CSV 编辑器 (Monaco + Blueprint Table2)
│   ├── ComponentShowcase.tsx  # Blueprint 6 组件展示
│   └── IconShowcase.tsx    # Blueprint 图标展示
├── theme/
│   ├── ThemeContext.tsx     # 主题上下文 (dark/light 切换)
│   └── themes.css          # `:root` / `:root.light` 所有颜色变量
├── main.tsx                # 入口, 加载 BP6 CSS + themes.css
└── index.css               # 全局 reset
```

## 设计决策
- **颜色变量**: 所有颜色定义在 `:root` (暗色) / `:root.light` (亮色) → 可通过 PortalProvider 让 BP6 Portal 组件 (Dialog/Drawer) 访问
- **暗色模式**: `.vscode` 加 `bp6-dark` 类 → BP6 内置暗色样式作用于非 Portal 组件; PortalProvider 为 Portal 容器加 `bp6-dark`
- **亮色模式**: `html` 加 `.light` 类; PortalProvider 不加 `bp6-dark`, BP6 默认亮色样式
- **Activity 栏**: `.vscode-activitybar-item svg` 用 `var(--text-bright)` + `opacity`
- **Dialog/Drawer**: 用 `.bp6-dark .bp6-dialog` 全局选择器覆盖 (因为是 Portal, 不在 `.vscode` 内)
- **CSV 数据同步**: `csvDataRef` (useRef) 避免闭包过期; `cellRendererDependencies` 强制 Table2 重渲染
- **按钮焦点**: `button:focus { outline: none !important }` 移除蓝色外框

## 已修复的问题
1. `bp5-` → `bp6-` 前缀
2. 对话框/抽屉背景透明的 Portal 作用域问题
3. Slider 标尺密度 (`labelStepSize=10`)
4. `<pre>` 不能放在 `<p>` 内
5. 活动栏 active 指示器 `top/bottom` 改为 `1px`
6. `useHotkeys()` 需要 `<HotkeysProvider>` 包裹
7. 图标名称需使用 `IconNames` 常量 (不是大写字符串)

## 备忘录
- 所有 Blueprint 图标用 `<Icon icon={IconNames.XXX} />` (从 `@blueprintjs/icons` 导入)
- `MultiSlider.Handle` 使用 `onChange` 属性 (不是 `onChangeBefore`)
- `CompoundTag` 右侧内容用 `children` (不是 `rightContent`)
- `OverlayToaster.create()` 返回 `Promise<Toaster>`, 需要用 `useRef` + `useEffect` 获取
- `Breadcrumbs` 从 `@blueprintjs/core/lib/esm/components/breadcrumbs/breadcrumbs` 导入 (BP6.15 顶部 re-export 缺失)
- `Tab` 用 `panel` 属性代替 `TabPanel` 组件
