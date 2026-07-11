# 原始素材：本项目经验与避坑

> 来源：
> - AGENTS.md（项目记忆，14 条已修复问题 + 设计决策 + 备忘录）✅
> - docs/p0-p1-fixes-2026-07-06.md（P0/P1 审计修复）✅
> - docs/code-audit-2026-07-06.md（审计报告）✅
> 可信度：✅ 已核验（项目实测）

## 安全类（P0）
- 凭据移出源码 → 读 `import.meta.env.VITE_CLIENT_ID` / `VITE_SPREADSHEET_ID`，缺失降级演示模式并告警；`.env` gitignored，`.env.example` 占位
- OAuth 令牌不落盘：仅存内存（`accessToken`/`expiresAt`），刷新后 GSI 静默重认证；userinfo 缓存非敏感
- `index.html` 加严格 CSP：`script-src` self+accounts.google.com，`connect-src` 仅 Google API，`frame-src` 仅 Google Sheets/账户
- 云端数据漂移修复：`loadTable` 缓存 `rowMap`（id→行号），update/remove 直接用行号写，不再每次全列 `findRow`
- 同步队列按错误类型分流：`isRetryableStatus()` —— 网络/超时/429/5xx 重试；401（无 refresh 只能重登）与 4xx 业务错误判永久失败移出队列；`fetchWithAuth` 加 15s `AbortController` 超时

## 质量/性能（P1）
- 移除 `// @ts-nocheck`（CashGrid、MaterialInfo）
- 表格行虚拟化：`@tanstack/react-virtual`，顶部/底部 spacer + `measureElement` 动态测高，保留表格语义与内联编辑
- 写操作缓存：`headerCache` / `sheetIdCache`（60s TTL），`insertRow` 返回新行号供维护 rowMap
- 清理废弃包：workspaces 否定模式排除 desk-ui/ui-dock/demo-ui 等，停止 @blueprintjs 进入安装图

## 历史修复清单（AGENTS.md 14 条）
1. bp5→bp6 前缀（已废弃，迁 MUI v9）
2. 对话框/抽屉透明 Portal 作用域（已废弃，MUI Dialog 自带）
3. Slider 标尺 `labelStepSize=10`
4. `<pre>` 不能放 `<p>` 内
5. 导航栏 active 指示器 top/bottom 改 1px
6. `useHotkeys` 需 `<HotkeysProvider>`
7. 图标用 `IconNames` 常量
8. `replaceAll` 误伤 `.app-body` → `-body`
9. App.css→index.css 合并
10. ref 赋值不能在 render 阶段 → useEffect
11. useMemo 依赖缺 searchParams/validIds → useState/useReducer lazy init
12. Dialog/Portal 作用域：根 div 加 `app-root`，CSS 改 `.app-root.bp6-dark`
13. 打印：移除 `position: fixed` 改正常流，`@media print` 覆盖 body/#root/... 为 block+auto；`.editor` display:none；字体 14px
14. `IconNames.SIDEBAR_LEFT` 等不存在 → ADD_COLUMN_LEFT 等

## 设计决策（节选）
- Provider 嵌套：`ThemeProvider > SheetsProvider > DockLayout`
- 颜色变量在 `:root`（暗）/`:root.theme-light`（亮）；MUI 经 createTheme + sx 访问
- 状态管理：Zustand 按业务拆分（plan/accounting/material/payment/docSettings），`planStore.applyFilter()` 在 setter 内合并调用
- 菜单栏默认 300px（min120/max600）
- 标题栏高 26px
- Vite base `/`（适配 Cloudflare Pages）
- 5 个页面 `React.lazy` 分包，首屏不加载 Monaco(~600KB)/xlsx(~416KB)
- 打印：`.layout-dock-{left|center|right|bottom}` 包裹，仅 `.layout-dock-right` 可打印

## 后续建议（P2，未处理）
- OAuth scope 收窄 + 后端代理持令牌（根治 P0-1）
- DataSource 接口抽象、通用模块工厂
- PWA + 顶层 ErrorBoundary + 多 tab BroadcastChannel 同步
