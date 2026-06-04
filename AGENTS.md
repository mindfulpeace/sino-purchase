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
│   ├── ui/                    # @sino-purchase/desk-ui (布局库)
│   │   ├── package.json       # 发布到 npm, peer deps: React/BP6
│   │   ├── vite.config.ts     # lib 模式构建
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts       # barrel 导出 + CSS 自动注入
│   │       ├── types.ts       # Activity, EditorTab, SidePanel, PropertiesPanel
│   │       ├── layout/        # 8 个布局组件 + AppLayout.css + blueprintOverrides.css
│   │       ├── theme/         # ThemeContext + themes.css
│   │       └── hooks/         # useSidebarResize, useTabs
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
├── apps/
│   ├── demo/                  # 演示应用 (消费者)
│   │   ├── package.json       # 依赖 @sino-purchase/desk-ui (workspace:*)
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   └── src/
│   │       ├── App.tsx        # 从 @sino-purchase/desk-ui 导入布局
│   │       ├── main.tsx
│   │       ├── index.css
│   │       ├── components/    # FileTree, CsvProperties
│   │       ├── config/        # sidePanels
│   │       ├── context/       # CsvContext
│   │       └── pages/         # CsvEditor, ComponentShowcase, IconShowcase, MonacoShowcase
│   └── sino-purchase-v2/      # 主应用 (sino-purchase-v2-main)
│       ├── package.json       # 依赖 @sino-purchase/desk-ui, @sino-purchase/sheets-api
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       └── src/
│           ├── App.tsx        # 4 个导航项 (计划管理/物料信息/记账报销/往来付款)
│           ├── main.tsx
│           ├── index.css
│           ├── vite-env.d.ts
│           └── pages/         # 4 个占位页面 (设计开发中)
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
- Demo app (`apps/desk-ui-demo`) 通过 npm workspace 引用本地库：`"@sino-purchase/desk-ui": "*"`
- 主应用 (`apps/sino-purchase-v2`) 引用 `@sino-purchase/desk-ui` + `@sino-purchase/sheets-api`
- 构建顺序: `packages/desk-ui` → `packages/sheets-api` → `apps/desk-ui-demo`
- `npm run dev` 启动主应用 dev server
- `npm run dev:demo` 启动 demo 应用
- `npm run build:sheets` 单独构建 sheets-api
- `npm run test` 运行 vitest (25 tests: ThemeContext 6, useTabs 11, useSidebarResize 8)
- `npm run typecheck` 运行 tsc -b 全项目类型检查
- `.github/workflows/ci.yml`: lint → typecheck → test → build
- `vitest.config.ts` 通过 `test.projects` 指向 `packages/desk-ui`
- Google Sheets API 数据流: `useSheetData<T>` → `db.ts` (loadTable/insertRow/updateRow/deleteRow) → `auth.ts` (requestToken) → Google Sheets REST API v4
- Sheets 离线队列: `sync-queue.ts` (localStorage) + `SyncProvider` → `processQueue()`
- Sheets 认证: GSI OAuth 2.0 (https://accounts.google.com/gsi/client), token 存 localStorage, 5 分钟前静默刷新
- `sheets-api` 无 runtime 依赖, 纯 fetch, peer deps 仅 React
