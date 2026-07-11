# 原始素材：其余库编译参考（专家编译，待核验）

> 来源：专家基于官方文档与项目代码编译（2026-07-08）
> 可信度：🟡 待核验 —— 版本敏感细节建议人工核对官方文档

## Vite 8（vite@8.0.16）
- 定位：下一代前端构建工具，基于 Rollup + esbuild，本项目 monorepo 构建入口
- 常用命令：`npm run dev`（主应用 5173）、`npm run build`、`npm run typecheck`（`tsc -b`）、`npm run test`（vitest）
- base path 设为 `/`（适配 Cloudflare Pages 部署）
- 注意：v8 较新，插件生态需确认 peer 兼容；AI 编译，建议核对官方迁移指南

## papaparse（papaparse@5.5.3）
- CSV 解析库，本项目用于导入（CashGrid ImportDialog 等）
- 关键 API：`Papa.parse(csvString|file, { header, skipEmptyLines, complete, error, dynamicTyping })`
- 导出：`Papa.unparse(data, { ... })`
- 大文件可用 `step` 回调逐行处理避免内存峰值

## Monaco Editor（@monaco-editor/react@4.7.0）
- React 封装的 VS Code 编辑器，本项目用于 SQL/文本编辑（懒加载 ~600KB）
- 用法：`<Editor height="100%" language="sql" value={v} onChange={(val)=>...} />`
- 需 `loader` 配置；首屏通过 React.lazy 分包避免拖慢

## Emotion 11（@emotion/react@11.14 / @emotion/styled@11.14）
- CSS-in-JS，MUI v9 的依赖（MUI 使用 emotion 作为样式引擎）
- 业务代码一般用 MUI `sx` 即可；高级场景用 `@emotion/styled` 或 `css` prop
- 主题通过 MUI ThemeProvider 注入，`useTheme()` 取色

## @tanstack/react-virtual（@tanstack/react-virtual@3.14.5）
- 行虚拟化，本项目用于 CashGrid / SheetsDataTab 大表
- 用法：`useVirtualizer({ count, getScrollElement, estimateSize, overscan })`
- 配合顶部/底部 spacer + `measureElement` 动态测高，保留 `<table>` 语义与内联编辑

## Google Sheets API v4（fetch 直连，无官方 SDK）
- 本项目用 OAuth (GSI) + 直接 `fetch('https://sheets.googleapis.com/v4/spreadsheets/...')`
- 逻辑层在 `packages/sheets-core`（auth/db/sync-queue）；React 绑定 `packages/sheets-react`
- 关键能力：读表（values.get）、写行（values.append / update）、建表（spreadsheets.create）、列头缓存
- 离线：内存令牌 + 同步队列（按错误类型分流重试），详见 `concepts/concept-offline-sync-conflict.md`
