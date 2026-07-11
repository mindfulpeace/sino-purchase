# 避坑指南（本项目经验沉淀）

> **类型**: topic
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/project-experience]]
> **可信度**: ✅ 来自 AGENTS.md（14 条修复）+ P0/P1 审计修复（项目实测）

## 摘要
汇总 sino-purchase-v2 开发过程中的高频坑与安全/性能修复，作为后续开发的"红绿灯"。

## 详情

### 🔴 安全类（P0，已止血）
1. **凭据外泄**：CLIENT_ID/SPREADSHEET_ID 曾硬编码源码 → 改为 `import.meta.env.VITE_*`，缺失降级演示模式；`.env` gitignored
2. **令牌落盘**：OAuth 令牌曾存 localStorage → 改为仅内存，刷新由 GSI 静默重认证；加 CSP 限制 script/connect/frame 源
3. **云端数据漂移**：update/remove 每次 `findRow` 全列扫描，rowIndex 漏传导致永久丢失 → 缓存 `rowMap`(id→行号)，直接用行号写
4. **同步队列雪崩**：任意错误无限重排到 1000 条 → `isRetryableStatus()` 分流，401/4xx 判永久失败移出队列；`fetchWithAuth` 加 15s 超时

### 🟡 质量/性能（P1）
5. `// @ts-nocheck` 已移除（CashGrid/MaterialInfo），类型检查通过
6. 大表用 `@tanstack/react-virtual` 行虚拟化（顶部/底部 spacer + `measureElement`）
7. 写操作缓存 `headerCache`/`sheetIdCache`(60s TTL)，`insertRow` 返回新行号
8. 清理废弃包（desk-ui/ui-dock 等），停止 @blueprintjs 进入安装图

### ⚙️ 历史修复清单（AGENTS.md 14 条，节选高频）
- `replaceAll` 误伤 `.app-body` → 删除 `.app` 时 class 名被截断（用精确匹配）
- ref 赋值不能在 render 阶段 → 移到 `useEffect`
- `useMemo` 依赖缺 `searchParams`/`validIds` → 改用 `useState`/`useReducer` lazy init
- Dialog/抽屉透明 Portal 作用域：根 div 加 `app-root`，CSS 改 `.app-root.bp6-dark`
- 打印：`position: fixed` 导致 `page-break-*` 失效 → 改正常流，`@media print` 覆盖 body/#root 为 block+auto，`.editor` display:none，字体 14px
- `IconNames.SIDEBAR_LEFT` 不存在 → `ADD_COLUMN_LEFT` 等
- `<pre>` 不能放 `<p>` 内；导航栏 active 指示器 top/bottom 改 1px

### 💡 通用避坑原则（专家综合）
- 云端表当 DB：永远缓存 id→行号，避免全表扫描
- 离线优先：队列必须按错误类型分流，否则小错拖垮全部
- 凭据/令牌：源码不留密，令牌不落盘
- 大表：先想虚拟化，再想分页

## 关联
- 相关实体: [[entities/product-google-sheets-api]], [[entities/product-tanstack-react-virtual]], [[entities/product-mui]]
- 相关概念: [[concepts/concept-offline-sync-conflict]], [[concepts/concept-erp-ux-patterns]]
- 参见: [[topics/topic-project-architecture]]

## 引用来源
- [1] [[raw/project-experience]] — AGENTS.md + p0-p1-fixes + code-audit
- [2] docs/p0-p1-fixes-2026-07-06.md

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/project-experience]]
