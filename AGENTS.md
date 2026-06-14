# 项目记忆

## 技术栈
- React 19 + Vite 8 + TypeScript 6
- Blueprint 6 (`@blueprintjs/core`, `@blueprintjs/icons`, `@blueprintjs/table`)
- Monaco Editor (`@monaco-editor/react`)
- CSV 解析: `papaparse`
- Google Sheets API v4 (OAuth via GSI, 无官方 SDK, 直接 fetch)

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

## 架构 (Monorepo)

```
sino-purchase-v2/
├── package.json               # npm workspaces root (private)
├── packages/
│   ├── desk-ui/               # @sino-purchase/desk-ui (布局库)
│   │   ├── package.json       # 发布到 npm, peer deps: React/BP6
│   │   ├── vite.config.ts     # lib 模式构建
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts       # barrel 导出 + CSS 自动注入
│   │       ├── types.ts       # Activity, EditorTab, SidePanel, PropertiesPanel
│   │       ├── layout/        # 8 个布局组件 + AppLayout.css + blueprintOverrides.css
│   │       ├── theme/         # ThemeContext + themes.css
│   │       └── hooks/         # useSidebarResize, useTabs
│   ├── utils/                 # @sino-purchase/utils (工具函数)
│   │   ├── package.json       # 零依赖纯 TS, peer deps: 无
│   │   └── src/
│   │       ├── clone.ts       # deepClone
│   │       ├── diff.ts        # calculateDiff, DiffResult
│   │       ├── diffSql.ts     # 差异→SQL 生成
│   │       ├── format.ts      # amountToWord (中文大写金额)
│   │       └── index.ts       # barrel 导出
│   ├── doc/                   # @sino-purchase/doc (文档组件)
│   │   ├── package.json       # 依赖 @sino-purchase/utils
│   │   └── src/
│   │       ├── DocReimburse.tsx  # 费用报销单组件 (纯 CSS, 无 Emotion)
│   │       ├── types.ts         # ReimbursementItem, DocReimburseProps
│   │       ├── doc.css          # 报销单样式
│   │       └── index.ts         # barrel + CSS auto-import
│   ├── print/                 # @sino-purchase/print (打印组件)
│   │   ├── package.json       # 零 runtime 依赖
│   │   └── src/
│   │       ├── PrintView.tsx   # A4 打印容器 (纯 CSS, 无 Emotion)
│   │       ├── PrintPaper.tsx   # 单页包装
│   │       ├── print.css        # print/media CSS
│   │       └── index.ts         # barrel + CSS auto-import
│   └── sheets-api/            # @sino-purchase/sheets-api (Google Sheets 数据层)
│       ├── package.json       # peer deps: React
│       ├── vite.config.ts     # lib 模式构建 (dts)
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts       # barrel 导出
│           ├── types.ts       # SheetsConfig, SyncOp, SyncStatus
│           ├── config.ts      # 运行时配置 (clientId, spreadsheetId)
│           ├── auth.ts        # GSI OAuth 封装
│           ├── db.ts          # Sheets REST API CRUD (泛型)
│           ├── sync-queue.ts  # 离线队列 (localStorage)
│           ├── SheetsProvider.tsx  # React Context 提供 config + sync
│           ├── useAuth.ts     # 认证 hook
│           ├── useSheetData.ts # 泛型数据 hook (add/update/remove/reload)
│           ├── useSync.tsx    # 同步状态 hook + SyncProvider
│           └── global.d.ts    # google.accounts.oauth2 类型声明
│   └── ui-dock/               # @sino-purchase/ui-dock (dockview 布局库)
│       ├── package.json       # peer deps: React, dockview, @blueprintjs/core, @blueprintjs/icons
│       ├── vite.config.ts     # lib 模式构建
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts       # barrel 导出 + CSS 自动注入
│           ├── types.ts       # NavigationItem, EditorTab, DockLayoutProps, StatusBarProps, EdgeGroupConfig
│           ├── DockLayout.tsx  # 主布局组件 (themeAbyss/themeLight, bp6-dark/bp6-light, useDock)
│           ├── HeaderToggles.tsx  # 边栏切换按钮 (Blueprint Icon)
│           ├── StatusBar.tsx  # 底部状态栏组件 (left/right slots)
│           ├── components.tsx  # DockMenuItem, DockInput, DockPlaceholder, DockSection
│           └── styles/
│               └── overrides.css  # 主题覆盖、Blueprint CSS 变量桥接、dockview 样式覆盖
├── apps/
│   └── demo-ui/              # 演示应用 (消费者)
│   │   ├── package.json       # 依赖 @sino-purchase/ui-dock (workspace:*)
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   └── src/
│   │       ├── App.tsx        # DockLayout + useDock, lazy-import 展示页
│   │       ├── main.tsx       # 导入 Blueprint CSS + dockview CSS + ui-dock CSS
│   │       ├── index.css
│   │       ├── components/
│   │       ├── config/
│   │       ├── context/
│   │       └── pages/
│   │           ├── ComponentShowcase.tsx  # Blueprint 组件展示 (11 sections)
│   │           ├── IconShowcase.tsx       # Blueprint 图标分类网格
│   │           ├── MonacoShowcase.tsx     # Monaco 编辑器展示
│   │           ├── CsvEditor.tsx          # CSV 编辑器
│   │           └── showcase/SectionBox.tsx  # Section/SectionCard 包装组件
│   └── sino-purchase-v2/      # 主应用 (sino-purchase-v2-main)
│       ├── package.json       # 依赖所有 @sino-purchase/* 包
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       └── src/
│           ├── App.tsx        # 5 个导航项 (计划管理/物料信息/记账报销/往来付款/设置)
│           ├── main.tsx
│           ├── index.css
│           ├── vite-env.d.ts
│           └── pages/
│               ├── Accounting.tsx       # 记账报销 (现金日记账, 完整实现)
│               ├── PlanManagement.tsx   # 计划管理 (完整实现)
│               ├── MaterialInfo.tsx     # 占位
│               ├── Payments.tsx         # 占位
│               ├── SheetsEditor.tsx     # Google Sheets 数据编辑
│               └── accounting/          # 记账报销子模块
│                   ├── types.ts         # CashRecord, ImportRecord
│                   ├── helpers.ts       # formatAmount, formatDataSummary
│                   ├── dataParser.ts    # CSV/TSV 解析器
│                   ├── sheetjs.ts       # Excel 导入/导出 (xlsx)
│                   ├── AccountingContext.tsx  # useReducer 状态管理
│                   ├── CashGrid.tsx      # Blueprint Table2 数据表格
│                   ├── ImportDialog.tsx  # 导入预览对话框
│                   ├── PrintableReimburse.tsx  # 报销单打印
│                   ├── Toolbar.tsx       # 导入/导出/打印工具栏
│                   ├── useReimburseData.ts  # 批次/税务分组聚合
│                   ├── useImportExcel.ts    # Excel 导入 hook
│                   └── useImportClipboard.ts # 剪贴板导入 hook
```

## 设计决策
- **Provider 嵌套**: `PortalProvider > OverlaysProvider > HotkeysProvider` (BP6 推荐顺序, Overlay2 需要 OverlaysProvider)
- **根元素类名**: 根 div 用 `app-root bp6-dark` 或 `app-root bp6-light`，`app-root` 用于 CSS 选择器限定（防止 portal div 的 `bp6-dark` 误匹配布局样式）
- **颜色变量**: 所有颜色定义在 `:root` (暗色) / `:root.bp6-theme-light` (亮色) → Portal 组件 (Dialog/Drawer) 可通过 `var()` 访问
- **暗色模式**: 根 div 加 `bp6-dark` 类 → BP6 内置暗色样式; PortalProvider 为 Portal 容器加 `bp6-dark`
- **亮色模式**: `html` 加 `.bp6-theme-light` 类 (ThemeContext useEffect); PortalProvider 不加 `bp6-dark`, BP6 默认亮色样式
- **Dialog/Drawer**: 用 `.bp6-dark .bp6-dialog` 全局选择器覆盖 (Portal 作用域问题)
- **CSV 数据同步**: `csvDataRef` (useRef) 避免闭包过期; `cellRendererDependencies` 强制 Table2 重渲染
- **按钮焦点**: `button:focus { outline: none !important }` 移除蓝色外框
- **拖拽缩放**: `useSidebarResize` 左栏 (手柄在右侧, `+clientX`); `useRightResize` 右栏 (手柄在左侧, `-clientX`)
- **CSS 覆盖文件**: 所有 BP6 组件颜色覆盖集中在 `blueprintOverrides.css`，无作用域前缀，因 SPA 自然隔离
- **懒加载**: 4 个页面均用 `React.lazy` 分包，首屏不加载 Monaco (~600KB) 和 ComponentShowcase (~135KB)
- **Tab 状态管理**: `useTabs` hook (useReducer + useSearchParams)，URL 用 `setSearchParams({replace:true})` 持久化，回到按钮正常
- **菜单栏默认**: 300px 宽，最小 120px，最大 600px；文件树 `text-overflow: ellipsis` 防换行
- **标题栏高**: 26px
- **ui-dock 主题**: 使用 `themeAbyss` (深蓝/紫) 作为暗色主题，`themeLight` 作为亮色主题。主题切换通过 `theme`/`setTheme` context 状态实现，`DockviewReact` 接收不同 theme 对象
- **ui-dock tab 高度**: `--dv-tabs-and-actions-container-height: 24px` (两个主题均设)，从默认 35px 缩减
- **ui-dock 标题栏**: `dv-titlebar-right` 区域用于消费者自定义按钮 (`headerRight` prop)；内置 `<HeaderToggles />` (Blueprint Icon, 左/下/右 edge 切换)
- **ui-dock 状态栏**: 内置 22px 状态栏，通过 `useDock()` context 的 `status`(左) + `summary`(右) 让消费者自由设置
- **ui-dock 面板文字**: `.dv-content-container` 使用 `opacity: 0.7` (暗色) / `0.85` (亮色)，标题 `opacity: 1.0`
- **ui-dock 焦点轮廓**: `--dv-paneview-active-outline-color: transparent` 禁用面板聚焦蓝色轮廓
- **ui-dock 编辑器 tab 按钮**: `.dv-tab .dv-default-tab-action { display: none }` 隐藏 float/maximize/minimize 按钮

## 已修复的问题
1. `bp5-` → `bp6-` 前缀
2. 对话框/抽屉背景透明的 Portal 作用域问题
3. Slider 标尺密度 (`labelStepSize=10`)
4. `<pre>` 不能放在 `<p>` 内
5. 导航栏 active 指示器 `top/bottom` 改为 `1px`
6. `useHotkeys()` 需要 `<HotkeysProvider>` 包裹
7. 图标名称需使用 `IconNames` 常量 (不是大写字符串)
8. `replaceAll` 误伤 `.app-body` → `-body` (删 `.app` 时 class 名被截断)
9. `App.css` → `index.css` 合并，去重 `#root` 宽高样式
10. `ref` 赋值不能在 render 阶段做 → 移到 `useEffect`
11. `useMemo` 依赖数组缺 `searchParams`/`validIds` → 改用 `useState`/`useReducer` lazy init
12. Dialog/Drawer 打开后布局崩溃: `AppLayout.css` 的 `.bp6-dark` 选择器无作用域限制，portal div 误获 `height:100vh;background:var(--bg-surface)` → 根 div 加 `app-root` 类名，CSS 改为 `.app-root.bp6-dark`
13. 打印字体缩小 + 分页失效：根因是 `.print-view` 用了 `position: fixed`，导致 `page-break-*` 被忽略（CSS 规范：分页只对根元素正常流中的块级元素生效），且 `#root { height: 100vh }` 和 `.editor { flex: 1 }` 在打印时未覆盖，限制了打印内容宽度。修复：`@media print` 中移除 `position: fixed`，改用正常流；`body/ #root/ .app-root/ .app-body/ .right/ .right-content` 全部 `display: block; height: auto; overflow: visible`；`.editor` 加入 `display: none`；打印字体改为 `14px`
14. `IconNames.SIDEBAR_LEFT`/`SIDEBAR_RIGHT` 不存在 — TS2339 错误，改用 `ADD_COLUMN_LEFT`/`REMOVE_COLUMN_LEFT` 和 `ADD_COLUMN_RIGHT`/`REMOVE_COLUMN_RIGHT`

## 备忘录
- 所有 Blueprint 图标用 `<Icon icon={IconNames.XXX} />` (从 `@blueprintjs/icons` 导入)
- `MultiSlider.Handle` 使用 `onChange` 属性 (不是 `onChangeBefore`)
- `CompoundTag` 右侧内容用 `children` (不是 `rightContent`)
- `OverlayToaster.create()` 返回 `Promise<Toaster>`, 需要用 `useRef` + `useEffect` 获取
- `Breadcrumbs` 从 `@blueprintjs/core/lib/esm/components/breadcrumbs/breadcrumbs` 导入 (BP6.15 顶部 re-export 缺失)
- `Tab` 用 `panel` 属性代替 `TabPanel` 组件
- IconShowcase 自动分组: 按 `IconNames` 枚举名前缀归为 Actions/Arrows/Files/UI/Editor/Graph 等
- 属性栏 (`PropertiesBar`) 通过 `AppLayout` 的 `propertiesPanel` prop 传入，可选中不传则不显示
- MonacoShowcase 已去掉 `readOnly: true`，可编辑
- 菜单栏内容 (`menu-content div, span`) 全局设为 `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
- `@sino-purchase/desk-ui` 是 monorepo 中的库包 (`packages/desk-ui`)，布局组件 + 主题 + hooks 全部抽取至此。CSS 提取到 `dist/index.css`，使用者需 `import "@sino-purchase/desk-ui/style.css"`
- Demo app (`apps/demo-ui`) 通过 npm workspace 引用本地库：`"@sino-purchase/ui-dock": "*"`
- 主应用 (`apps/sino-purchase-v2`) 引用 `@sino-purchase/desk-ui` + `@sino-purchase/sheets-api` + `@sino-purchase/utils/doc/print`
- 构建顺序: `packages/desk-ui` → `packages/ui-dock` → `packages/sheets-api` → `apps/demo-ui`
- `npm run dev` 启动主应用 dev server
- `npm run dev:desk` 启动 desk-ui demo 应用
- `npm run build:sheets` 单独构建 sheets-api
- `npm run build:utils` 单独构建 utils
- `npm run build:doc` 单独构建 doc
- `npm run build:print` 单独构建 print
- `npm run test` 运行 vitest (25 tests: ThemeContext 6, useTabs 11, useSidebarResize 8)
- `npm run typecheck` 运行 tsc -b 全项目类型检查
- `.github/workflows/ci.yml`: lint → typecheck → test → build
- `vitest.config.ts` 通过 `test.projects` 指向 `packages/desk-ui`
- Google Sheets API 数据流: `useSheetData<T>` → `db.ts` (loadTable/insertRow/updateRow/deleteRow) → `auth.ts` (requestToken) → Google Sheets REST API v4
- Sheets 离线队列: `sync-queue.ts` (localStorage) + `SyncProvider` → `processQueue()`
- Sheets 认证: GSI OAuth 2.0 (https://accounts.google.com/gsi/client), token 存 localStorage, 5 分钟前静默刷新
- `sheets-api` 无 runtime 依赖, 纯 fetch, peer deps 仅 React
- `@sino-purchase/utils` 零依赖，提供 `amountToWord`(中文大写金额)/`deepClone`/`calculateDiff`/`diffSql`
- `@sino-purchase/doc` 提供 `DocReimburse` 费用报销单组件，纯 CSS (无 Emotion)，需导入 `style.css`
- `@sino-purchase/print` 提供 `PrintView`(A4 打印容器) + `PrintPaper`(单页包装)，纯 CSS (无 Emotion)，需导入 `style.css`
- 记账报销页面 (`apps/sino-purchase-v2/src/pages/Accounting.tsx`) 使用 `AccountingProvider`(useReducer) 管理状态，数据存放在内存中（未接入 sheets-api），支持 Excel/剪贴板导入和报销单打印预览
- `CashGrid` 使用 `@blueprintjs/table` 的 `Table2` + `Column`，按税务字段 HSL 着色，支持点击排序
- 导入流程: Excel 或剪贴板 → 解析为 CashRecord[] → ImportDialog 预览 → 确认 → 加入状态
- `@sino-purchase/ui-dock` 是 dockview 布局库，提供 `DockLayout` 组件和 `useDock` hook。导出 `StatusBar`、`DockMenuItem`、`DockInput`、`DockPlaceholder`、`DockSection` 组件。使用 `themeAbyss`/`themeLight` 主题。peer deps 含 Blueprint
- ui-dock Context API (`useDock()`): `openEditor(id)`, `closeEditor(id)`, `getApi()`, `setLeftVisible(v)`, `setRightVisible(v)`, `setBottomVisible(v)`, `leftVisible`, `rightVisible`, `bottomVisible`, `status`, `summary`, `setStatus(msg)`, `setSummary(msg)`, `theme`, `setTheme(t)`
- ui-dock Props: `title?`, `headerRight?` (ReactNode), `navigation[]`, `editors?`, `properties?`, `bottom?`, `left?`, `right?`, `bottomEdge?` (EdgeGroupConfig), `defaultTheme?`, `rightDefault?`, `bottomDefault?`, `statusBar?`, `onReady?`
- `npm run build:dockview` 单独构建 ui-dock
- ui-dock edge groups: left (导航面板, 300px), right (属性栏, 350px, 默认隐藏), bottom (底部面板, 200px, 默认隐藏)
- dockview 主题切换需要传递不同 theme 对象给 `DockviewReact`，不能仅通过 CSS 类切换
- `--dv-tabs-and-actions-container-height` 必须在每个主题类下单独设置（变量作用域不共享）
- `IconNames.SIDEBAR_LEFT`/`SIDEBAR_RIGHT` 不存在 — 使用 `ADD_COLUMN_LEFT`/`REMOVE_COLUMN_LEFT` 和 `ADD_COLUMN_RIGHT`/`REMOVE_COLUMN_RIGHT`
