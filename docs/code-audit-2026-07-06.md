# sino-purchase-v2 代码结构与架构审计报告

> 审计日期：2026-07-06 ｜ 审计范围：`apps/sino-purchase-v2`（主应用）、`packages/*`（8 个库）、`apps/demo-ui` 等 demo 工程
> 审计方式：静态阅读源码 + 全局检索（无运行态渗透）。下文每条均给出文件/行号依据与可落地的优化方向。

## 总体评价

项目整体架构清晰：**Monorepo + 按业务拆分的 Zustand store + sheets-core/sheets-react 数据层 + layout-dock 布局框架**，并以 `theme.ts` 作为设计令牌单一来源，方向是对的。但存在几个**会随数据量增长和团队扩大而放大**的问题：

- 安全层面：OAuth 令牌落地 `localStorage`、scope 过宽、敏感 `SPREADSHEET_ID` 入库；
- 质量层面：两个核心文件用 `// @ts-nocheck` 关闭类型检查，且核心数据链路几乎零测试；
- 性能层面：表格未虚拟化 + 每次写操作都 `findRow` 全列扫描；
- 架构层面：`useSheetData` 与 `planStore` 形成双数据源，且丢弃了可用于定位行号的 `rowMap`（已引发正确性风险）。

下面按五个维度展开。

---

## 一、安全隐患（建议优先处理）

### 1.1 OAuth 访问令牌存于 localStorage —— XSS 可窃取
**依据**：`packages/sheets-core/src/auth.ts:21-22,50-56` 将 `access_token`/`expires_at`/`userinfo` 写入 `localStorage`。
**风险**：本应用通过动态 `<script>` 加载 Google GSI（`auth.ts:35`），未来若引入任何第三方 SDK 或存在一处 XSS，令牌会被脚本读取并外泄，攻击者可凭令牌读写用户所有 Google Sheets（scope 见 1.2）。
**优化方向**：
- 引入轻量后端代理（CloudFlare Worker 或 HostGator PHP）持有并刷新 token，前端仅持 `httpOnly` cookie 的会话标识；
- 若必须前端持有，用 Web Crypto 对令牌加密后再存，且全程加 `Content-Security-Policy` 头收紧脚本来源，降低 XSS 面。

### 1.2 OAuth scope 过宽
**依据**：`auth.ts:77` 默认 `https://www.googleapis.com/auth/spreadsheets`（对用户所有可访问表格的读写权限）。
**风险**：一旦令牌泄露，影响面是所有表格而非仅本项目那一张。Google GSI 无法在 scope 层限定到单个 spreadsheet，只能在授权端控制。
**优化方向**：用后端代理在服务端调用 Sheets API，前端 scope 降为最小（甚至仅 `spreadsheets.appdata`/自定义后端授权）；代理层把访问锁定到指定 `SPREADSHEET_ID`。

### 1.3 真实 `SPREADSHEET_ID` 硬编码并提交仓库
**依据**：`apps/sino-purchase-v2/src/config/sheets.ts:2` 直接写死真实表格 ID。
**风险**：资源标识泄露；若误把表格分享权限放宽，外人可凭 ID 直接定位。也导致 demo/生产环境无法切换。
**优化方向**：改为 `import.meta.env.VITE_SPREADSHEET_ID`，`.env` 不入库（用 `.env.example` 留存占位）；demo 模式走独立只读副本。

### 1.4 fetch 无超时 + 同步队列"吞错无限重排"
**依据**：`db.ts:30-47` 的 `fetchWithAuth` 无 `AbortController` 超时；`db.ts:8-28` 的 `processQueue` 对**所有**异常都 `remaining.push(op)` 重排，永久错误（如 4xx 字段错误）会一直重试直到 `MAX_QUEUE=1000` 被截断。
**优化方向**：按错误类型分流——网络/401/429/5xx 可重试（带指数退避），4xx 业务错误标记失败并上报告警、移出队列；`fetchWithAuth` 统一加超时与重试预算。

---

## 二、架构设计合理性

### 2.1 `useSheetData` 与 `planStore` 构成双数据源
**依据**：`pages/PlanManagement.tsx:76` 用 `useEffect(() => setAllTasks(sheetData), [sheetData])` 把 provider 数据同步进 store；store 又是 UI 唯一真相。
**风险**：两层状态存在 effect 竞态与不一致窗口；demo 模式下 `reload()`（`useSheetData.ts:30-33`）会把 `data` 重置回 `demoData` 引用，导致已做的本地编辑丢失。
**优化方向**：确立单一权威源——推荐 store 作为 UI 真相、`sheets-react` 仅做 IO 适配；或让 store 通过 `useSyncExternalStore` 直接订阅 sheets 数据，消除同步 effect。

### 2.2 更新/删除丢弃 `rowMap`，已导致云端数据漂移
**依据**：`useSheetData.ts:49` 调用 `loadTable` 但**未使用返回的 `rowMap`（id→行号）**；`update/remove`（`useSheetData.ts:76-96`）改为每次 `findRow`（`db.ts:105` 拉整列 A 线性扫描）定位行。
**风险（正确性 bug）**：当 `findRow` 返回 `null`（本地 id 与云端行号映射错位、或行已被他人删除）时，`remove` 已乐观删掉本地数据但云端未删 → **数据永久漂移**；`add/remove` 在 `findRow` 失败路径上不会入队，操作静默丢失。
**优化方向**：缓存并使用 `loadTable` 返回的 `rowMap`；写操作直接用行号，避免 `findRow`；对"找不到行"的情况给出可见错误而非静默。

### 2.3 `SheetsProvider` 在渲染阶段调用副作用 `configure()`
**依据**：`SheetsProvider.tsx:21` 组件体内直接 `configure(config)`。
**风险**：违反"副作用应在 effect"原则，StrictMode 双调用会执行两次；虽当前 `configure` 仅是赋值，但耦合了隐式时序依赖。
**优化方向**：移入 `useEffect` 或模块初始化；`config` 用 `useMemo` 稳定后传入。

### 2.4 跨模块同步用 `window` 事件，缺多 tab 协同
**依据**：`sync-queue.ts:25,34` 与 `useSync.tsx:37-44` 用 `window.dispatchEvent(CHANGE_EVENT)` + `online/offline` 监听。
**优化方向**：多 tab 场景改用 `BroadcastChannel` 广播队列变化；登录成功后主动 `process()` 一次，确保离线期间累积的写操作及时回放。

---

## 三、性能瓶颈

### 3.1 现金日记账/Sheets 表格未虚拟化
**依据**：`modules/accounting/CashGrid.tsx:41-78` 与 `modules/accounting/SheetsDataTab.tsx:179-194` 用原生 `<table>` 一次性渲染全部行（CashGrid 每行还是一个 `<input>`）。`@tanstack/react-virtual` 已装（`package.json` 依赖）但未被用于这些大表。
**风险**：记录累积后 DOM 节点线性膨胀，输入/滚动明显卡顿。
**优化方向**：用 `@tanstack/react-virtual` 行虚拟化；CashGrid 改为"非编辑态纯文本 + 双击进入编辑"以减少常驻 `<input>` 数量。

### 3.2 每次写操作 N+1 网络调用（findRow + 重取表头）
**依据**：`updateRow/insertRow`（`db.ts:163-200`）每次先 `fetch(!1:1)` 取表头；`findRow`（`db.ts:105`）每次拉整列 A 扫描。
**优化方向**：表头与 `sheetIdCache` 在首次加载后缓存复用；行号用 2.2 的 `rowMap`，避免重复扫描。

### 3.3 `ensureSheet` 每次加载都拉全表元数据
**依据**：`loadTable` → `ensureSheet` → `refreshSheetCache`（`db.ts:83-98,51-64`）每次 `loadTable` 都请求 spreadsheet 元数据。
**优化方向**：`sheetIdCache` 加 TTL 或"写后失效"标记，避免重复请求。

### 3.4 `loadTable` 硬拉 `1:10000` 全量入内存
**依据**：`db.ts:131` 固定读取 `1:10000`。
**风险**：超过 1 万行静默截断；全量载入内存对大表不友好。
**优化方向**：分页读取或按可视范围懒加载；大数据量交给后端代理缓存。

### 3.5 `planStore` 每次输入重排全量
**依据**：`planStore.ts:209-214` 每次 filter setter 都 `set(applyFilter())` → 多字段 filter + `sort`（O(n log n)）。
**优化方向**：搜索框 `searchQuery` 做 ~200ms `debounce`；filter 与 sort 分阶段，避免 keystroke 级重排。

---

## 四、代码质量与可维护性

### 4.1 生产文件用 `// @ts-nocheck` 关闭类型检查
**依据**：`CashGrid.tsx:1`、`pages/MaterialInfo.tsx:1`。
**风险**：CashGrid 是核心表格，`handleCellChange`（`CashGrid.tsx:20-25`）隐含 `records[rowIndex]` 越界与字段类型错配，全部逃过编译期检查。
**优化方向**：移除 `ts-nocheck`，按报错逐项修复类型；把 `records[rowIndex]`/`col` 的空值守卫补上。

### 4.2 兼容层 `components/ui` 大量 `as any`
**依据**：`components/ui/components.tsx` 约 40 处 `as any`（如 `value?: any`、`onChange?: (value: any)`、`sx as any`）。
**风险**：兼容层作为对外 API，弱类型会向业务组件传播，丢失 MUI 原有的严格约束。
**优化方向**：对外暴露的 `Select/Input/Tabs` 等收紧 `value/onChange/options` 类型；`sx` 保留 `SxProps` 而非 `any`。

### 4.3 废弃包未清理，连带重型依赖
**依据**：`packages/desk-ui`、`packages/ui-dock` 在 AGENTS.md 中已标记 DEPRECATED，仍被 `apps/demo-ui`、`apps/layout-dock-demo` 引用，并拉入 `@blueprintjs/core|icons|table`。
**风险**：安装图臃肿、维护面扩大、团队易误用旧 API。
**优化方向**：删除废弃包及其专属 demo（`demo-ui`/`layout-dock-demo` 可合并为单一 showcase 或直接下线）；从 `package-lock` 解耦 blueprint 依赖。

### 4.4 设计令牌单一来源被绕过
**依据**：`var(--border, #3a3a5a)`、`var(--bg-hover)` 等回退值散落在 `components.tsx`、`CashGrid.tsx`、`App.tsx`。
**风险**：与 `theme.ts` "单一来源"理念冲突，主题切换时回退色可能不一致。
**优化方向**：回退值统一从 `designTokens` 生成后注入；组件内优先用 `theme.palette.*` 而非硬编码 `var()`。

### 4.5 测试覆盖极低
**依据**：仅 10 个测试文件，且 `planStore`、`CashGrid`、`SheetsDataTab`、`useSheetData`、`auth`、`db`、`sync-queue` 等核心链路**均无测试**。
**优化方向**：优先补四类测试——store reducer（filter/stat 计算）、`db.ts` 重试/队列逻辑、`auth.ts` 状态机、`useSheetData` 乐观更新与失败回滚；再上页面级集成测试。

### 4.6 键盘快捷键按 placeholder 查 DOM
**依据**：`PlanManagement.tsx:196` `document.querySelector('[placeholder="品名 回车快速添加"]')`。
**风险**：与文案强耦合，改文案即失效。
**优化方向**：用 `ref` 或 `data-testid`/`data-quickadd` 属性定位。

### 4.7 占位页文案误导
**依据**：`MaterialInfo.tsx:64`、`Payments.tsx:81` 写"数据已持久化到 localStorage"，但页面实质未实现。
**优化方向**：改为"模块开发中"或移除误导性文案。

---

## 五、可扩展性

### 5.1 新增业务模块样板过重
**依据**：每个模块需手写 store + page + 多个组件 + sheets 绑定；`materialStore/paymentStore` 已建但页面仍是占位，说明缺乏统一模板。
**优化方向**：抽取 `createSheetStore(config)` 工厂或基于 `useSheetData` 的通用列表/编辑页，新模块只声明 schema 即可。

### 5.2 Sheets IO 与 Google 强耦合
**依据**：所有读写集中 `db.ts` 直接 `fetch` Google API。
**优化方向**：定义 `DataSource` 接口（`load/save/insert/update/delete`），Google 实现其一；后续可插后端代理/缓存层/多数据源而不动业务。

### 5.3 字段/表头映射分散
**依据**：`SheetsDataTab.FIELD_MAP`、`modules/plan/types.ts` 的 `TASK_HEADERS`、各 store 散落。
**优化方向**：集中定义 schema（字段名、类型、中文标签、Sheets 列名映射），一处定义、多处复用。

### 5.4 无 PWA / 离线应用壳
**依据**：全仓无 `serviceWorker`/`manifest`（检索无果）。离线编辑仅靠 localStorage 队列，应用壳本身不缓存。
**优化方向**：引入 `vite-plugin-pwa`，对弱网（赞比亚网络）体验提升明显。

### 5.5 无顶层 ErrorBoundary
**依据**：全仓无 `ErrorBoundary`/`componentDidCatch`（检索仅命中第三方库类型定义）。
**风险**：任一模块抛错即整页白屏。
**优化方向**：在 `App.tsx` 顶层包 `ErrorBoundary` + 兜底 UI 与"重试"按钮。

### 5.6 构建目标不一致
**依据**：`vite.config.ts:26` `build.target: "es2020"`，而 `tsconfig` 用 `target es2023`/`lib es2023`；`crypto.randomUUID` 需 secure context（部署到 http 域会失效）。
**优化方向**：统一 target/lib；部署强制 HTTPS；dev 下 `localhost` 可用但需文档说明。

---

## 优先级行动清单

**P0（安全 + 正确性，先止血）**
1. OAuth 令牌不再裸存 localStorage（后端代理或 Web Crypto 加密）；加 CSP。
2. `SPREADSHEET_ID` 移出源码，改环境变量。
3. 修复 2.2：使用 `rowMap` 定位行号，消除云端数据漂移与静默丢失。
4. `processQueue` 按错误类型分流，停止永久错误无限重排。

**P1（质量 + 性能，提升健壮性）**
5. 移除 `CashGrid.tsx`/`MaterialInfo.tsx` 的 `// @ts-nocheck`。
6. 表格虚拟化（CashGrid、SheetsDataTab）。
7. 缓存表头与 `sheetIdCache`；写操作避免 `findRow` 全列扫描。
8. 核心数据链路补测试（store / db / auth / useSheetData）。
9. 清理废弃包 `desk-ui`/`ui-dock` 及其 demo。

**P2（架构演进，长期可维护性）**
10. 统一数据源（store 权威 + sheets 仅 IO），或 `useSyncExternalStore`。
11. 抽取 `DataSource` 接口与通用模块工厂，降低新模块成本。
12. 引入 PWA + 顶层 ErrorBoundary + 多 tab 同步（`BroadcastChannel`）。

---

## 附：已确认事实依据（节选）

| 项 | 文件:行 |
|---|---|
| OAuth 令牌存 localStorage | `packages/sheets-core/src/auth.ts:21,50-56` |
| 默认 scope 过宽 | `packages/sheets-core/src/auth.ts:77` |
| SPREADSHEET_ID 硬编码 | `apps/sino-purchase-v2/src/config/sheets.ts:2` |
| 同步队列吞错重排 | `packages/sheets-core/src/db.ts:8-28,45` |
| 双数据源同步 | `apps/sino-purchase-v2/src/pages/PlanManagement.tsx:76` |
| rowMap 被丢弃 | `packages/sheets-react/src/useSheetData.ts:49,76-96` |
| 表格未虚拟化 | `modules/accounting/CashGrid.tsx:41-78`、`SheetsDataTab.tsx:179-194` |
| ts-nocheck | `CashGrid.tsx:1`、`pages/MaterialInfo.tsx:1` |
| 兼容层 as any | `components/ui/components.tsx`（约 40 处） |
| 无 ErrorBoundary / PWA | 全仓检索无命中 |
| 测试文件 | 仅 10 个，核心链路缺失 |
