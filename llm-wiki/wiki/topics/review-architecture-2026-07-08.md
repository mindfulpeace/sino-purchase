# 架构与写法审查报告（sino-purchase-v2, 2026-07-08）

> **类型**: topic (review)
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08（第二轮：P0/P1/P2 已落地）
> **来源**: 知识库标准页 + 代码实况对账（见"证据"列）
> **可信度**: ✅ 基于 llm-wiki 概念/实体页标准，逐文件核对源码（App.tsx / main.tsx / planStore / materialStore / db.ts / useSheetData / useSync / SheetsProvider / theme.ts / MaterialInfo / PlanManagement）

## 摘要
对照知识库中的 ERP 行业规范与库参考标准，逐一核对了项目源码。结论：**底层数据链路（离线同步、id→行号缓存、设计令牌）质量高、值得保留**；主要债务集中在**状态层架构**（planStore 既是数据副本又是 CRUD 注入器）、**持久化范式分裂**（materialStore 用 localStorage，其余用 Google Sheets）、**已建能力未落地到 UI**（同步状态指示）、以及若干写法脚枪（effect 依赖、魔法数字、Set 状态、N 次顺序写）。给出 P0–P2 优化清单与一处"改版"草图。

## 审查方法
- 标准来源：`[[concepts/concept-erp-module-architecture]]`（单一数据源/模块边界）、`[[concepts/concept-offline-sync-conflict]]`（失败可见/队列分流）、`[[concepts/concept-erp-ux-patterns]]`（高密度交互）、`[[entities/product-zustand]]`（v5 派生状态）、`[[entities/product-react]]`（19 写法）。
- 实况来源：读取 `apps/sino-purchase-v2/src` 与 `packages/sheets-{core,react}/src` 关键文件。
- 共核实并排除 1 处误判：离线队列"重连自动排空"实际已由 `SyncProvider` 接好（见下）。

## 架构健康度（专家综合判断）
| 维度 | 评级 | 说明 |
|------|------|------|
| 包边界 / monorepo | 🟢 优 | sheets-core(无React) / sheets-react / layout-dock 分离清晰 |
| 离线同步链路 | 🟢 优 | 错误分流 + 队列上限 + 重连排空，符合 [[concepts/concept-offline-sync-conflict]] |
| 设计系统 | 🟢 良 | `theme.ts` 令牌单一来源，但主题"应用"仍 3 套手动同步 |
| 状态层架构 | 🟡 中 | planStore 数据副本 + CRUD 注入反模式 |
| 持久化一致性 | 🟡 中 | materialStore(localStorage) 与其余(Sheets)分裂 |
| 同步能力落地 | 🟡 中 | 能力已建但主应用无 UI 指示 |
| 写法严谨度 | 🟡 中 | 魔法数字 / `as any` / effect 脚枪 / 死依赖 |

## 亮点（建议保留）
1. **离线优先同步设计扎实**：`isRetryableStatus()` 按 HTTP 状态分流，401/4xx 判永久失败丢弃（避免无限重排挤爆 `MAX_QUEUE=1000`）；`SyncProvider` 挂载于 `SheetsProvider` 内（`packages/sheets-react/src/SheetsProvider.tsx:29`），监听 `online` 事件触发 `processQueue()` 排空队列 → 重连自愈成立。
2. **id→行号缓存**：`useSheetData` 用 `rowMapRef` 缓存 `loadTable` 返回的 `id→行号`，写操作直接用行号，规避 `findRow` 全列扫描（P0-3 修复）。这是把 Google Sheets 当 DB 的正确姿势。
3. **设计令牌单一来源**：`theme.ts` 的 `designTokens` + `buildMuiTheme` + `:root` CSS 变量注入，颜色全收敛于此。
4. **性能姿态好**：5 个页面 `React.lazy` 分包，Monaco/xlsx 不进首屏；`planStore` 用 `dataVersion` 缓存签名避免无谓重算。
5. **Provider 嵌套正确**：`ThemeContext > MuiThemeProvider > SheetsProvider(SyncProvider) > DockLayout`，无环、职责清晰。

## 问题清单（按严重度）

### 🔴 P0 — 建议尽快处理（正确性/一致性风险）
**P0-1 状态层"上帝 store" + CRUD 注入反模式**
- 现象：`planStore` 同时装了「数据(allTasks) + 过滤状态 + 派生统计 + UI 状态(editingTaskId/isAdding/batchEdit/selectedIds/showSettings/showFilter)」；并预留**空实现 CRUD 桩** `addTask: () => {}`，由 `PlanManagement` 经 `setCrudActions()` 反向注入（`planStore.ts:301`、`PlanManagement.tsx:79`）。
- 后果：① 双重数据源——`useSheetData` 持有 `data`，又 `useEffect(() => setAllTasks(sheetData), [sheetData])` 拷进 store，多一跳 re-render；② 若 `setCrudActions` 未调用，写操作静默空跑（无类型保护）。
- 建议：store 只保留过滤/UI/派生态；数据归 `useSheetData` 所有。组件直接调用 `useSheetData().add/update/remove`，删掉 `setCrudActions`。可抽 `usePlanData()` 组合 hook。
- 关联：[[entities/product-zustand]]、[[concepts/concept-erp-module-architecture]]

**P0-2 持久化范式分裂（localStorage vs Google Sheets）**
- 现象：`materialStore` 用 `zustand/persist` 落 `localStorage`（`materialStore.ts:19`），而 plan/accounting 走 `useSheetData`→Google Sheets（云端+离线同步）。两套路、两套 API。
- 后果：物料主数据（ERP 最该共享一致的数据）无法跨设备、无冲突处理、无离线同步；且模块间写法不统一，新增模块易踩范式选择坑。
- 建议：① 优先把 `MaterialInfo` 迁到 `useSheetData` + 一张 `materials` 表（与 ERP 单一数据源原则一致）；② 若确要本地-only，显式抽出 `useLocalPersist` 并文档化，使其成为"有意选择"而非漂移。
- 关联：[[concepts/concept-erp-module-architecture]]、[[concepts/concept-offline-sync-conflict]]

### 🟡 P1 — 应处理（可用性/健壮性/技术债）
**P1-1 同步状态能力已建但未在产品中露出**
- 现象：`SyncProvider` 已挂载并正确排空队列，但 `useSync()`/`failedCount` 仅在 `apps/sheets-api-demo` 使用，主应用无同步指示 UI。
- 后果：符合 [[concepts/concept-offline-sync-conflict]] 要求的"失败可见"未在主产品兑现；用户不知道有写操作被丢弃或队列积压。
- 建议：在状态栏/登录面板加 `SyncIndicator`，消费 `useSync()` 显示 `status` + `failedCount` + `retry()`。能力已备，纯 UI 接入。

**P1-2 死依赖：`react-router-dom` 在主应用未用**
- 现象：`main.tsx:3,14` 包了 `<BrowserRouter>`，但主应用无任何 `<Routes>/<Route>/useNavigate`。
- 后果：无意义的包体积与认知负担。
- 建议：移除 `BrowserRouter` 与依赖；若未来要深链 dock 状态再引入。

**P1-3 `useSheetData` effect 依赖脚枪（目前侥幸安全）**
- 现象：load effect 依赖 `[loadKey, sheetName, headers, numericFields, dateFields, demoData]`（`useSheetData.ts:64`）。`PlanManagement` 传的是模块级常量故引用稳定——但若任何调用方传入**内联字面量数组**，会触发 `setData→re-render→新数组→effect 重跑→无限重载`。
- 建议：依赖收窄为 `[loadKey, sheetName]`，其余经 `ref` 读取；或在 hook 文档/eslint 标注"必须 memoize"。低代价去掉隐藏陷阱。

**P1-4 无 ErrorBoundary**
- 现象：`main.tsx` 无顶层错误边界；`MaterialInfo.tsx:51` 的 `m.price.toLocaleString()` 在 price 缺失时会抛错（localStorage 历史数据可能无 price），且任一 lazy 页渲染崩溃会拖垮整个 dock。
- 建议：加顶层 `ErrorBoundary` + 各 editor 独立边界；`MaterialInfo` 对 price 做空值兜底。

**P1-5 批量更新触发 N 次顺序云端写**
- 现象：`planStore.confirmBatchApply` 对 `selectedIds` 逐个 `updateTask`（`planStore.ts:286`），每次一条 Sheets PUT。
- 建议：在 `sheets-core` 增 `batchUpdate`（复用已存在的 `batchUpdate` 端点，一次请求写多行），减少请求数与重试面。

### 🟢 P2 — 可优化（整洁度/可维护性）
**P2-1 领域枚举魔法数字**
- `TaskStatus`(1/2/3)、`urgency`(2–5) 散落比较（`planStore.ts:315` `t.status < 3`、`urgency > 3`）。建议 `as const` 联合 + 集中 label 映射（部分已在 `PlanManagement.tsx` 的 `GROUP_SORT_MAP` 附近，合并即可）。

**P2-2 `Set` 入 Zustand state**
- `selectedIds: new Set<string>()`（`planStore.ts:273`）破坏序列化与 `useShallow` 友好度，改 `string[]` 更惯用。

**P2-3 `setter` 用 `as any` 绕过类型**
- `planStore.ts:216` `set({ [key]: value } as any)` 弱化了 TS6 严格性；改用映射类型 setter。

**P2-4 主题"应用"仍 3 套手动同步**
- CSS 变量 / MUI 主题 / dockview 主题(`themeAbyss`/`themeLight`) 靠传 `theme` 字符串手动对齐。抽 `useThemeMode()` 统一返回三者，新增受控面只消费一个 hook。（设计系统页称"单一来源"实为"颜色单一来源"，应用层仍 3 路。）

**P2-5 废弃包仍在树**
- `packages/desk-ui`、`packages/ui-dock` 已 DEPRECATED（AGENTS.md）却仍带 `dist/`，增加误引与认知负担。P1 曾列"清理废弃包"，建议归档到 `archive/` 或删除。

**P2-6 文档漂移 / 未闭环**
- `docs/dockview-research.md`、`docs/p0-p1-fixes-2026-07-06.md`、`docs/code-audit-2026-07-06.md` 是优质原始素材，但 wiki 标"待 ingest"未消化；`AGENTS.md` 与 wiki 部分重叠。建议对这 3 份执行一次 wiki ingest，闭合知识库自荐的回路。

## 改版草图（针对 P0 状态层 + 持久化）
> 目标：单一数据源、store 不再持有数据副本、模块持久化统一。

```
现状（双副本 + 注入）                改版后（hook 为数据源）
┌─────────────┐                      ┌──────────────────┐
│ useSheetData│──data──┐             │ useSheetData     │ (数据唯一 owner)
└─────────────┘        ▼             │  .add/.update/.  │
                  ┌──────────┐        │   .remove         │
                  │ planStore│        └────────┬─────────┘
                  │ allTasks │◄──拷贝          │ 组件直接调用
                  │ (副本)   │                 ▼
                  │ CRUD桩   │        ┌──────────────────┐
                  │ +注入    │        │ planStore(瘦身)   │
                  └──────────┘        │ 仅: filter/UI/    │
                        ▲             │ derived(selected) │
                        │注入          └──────────────────┘
                  PlanManagement
```

- `MaterialInfo`：替换为 `useSheetData<Material>({ sheetName:"materials", ... })`，删 `materialStore` 的 persist；与 plan/accounting 同范式。
- 通用的"数据 owner"就是 `useSheetData`，各业务 store 只管交互态与派生量；彻底消除 setCrudActions 注入。

## 优先级路线图
1. **本周**：P0-1（去数据副本 + 删 setCrudActions）、P0-2（物料表迁 Sheets 或显式本地化）、P1-4（ErrorBoundary）。
2. **下个迭代**：P1-1（SyncIndicator UI）、P1-2（去 router 死依赖）、P1-3（effect 依赖收窄）、P1-5（batchUpdate）。
3. **维护性**：P2 全部并入日常重构；P2-6 顺手把 docs/ 三份 ingest 进 wiki。

## 处理状态（第二轮，2026-07-08）
> 用户选择"全部落地代码"；其中 P0-2 与废弃包删除属高风险架构改动，按约定出文档、待确认后落地。

| 项 | 状态 | 落地说明 |
|----|------|----------|
| P0-1 状态层去副本+删注入桩 | ✅ 已落地 | 新增 `PlanDataContext`，`useSheetData` 为唯一数据源；删 `setCrudActions`/`allTasks` 副本；3 测试重写经 DOM 断言 |
| P0-2 物料持久化迁移 | 📄 出文档 | 见 [[topics/topic-material-persistence-migration]]，路线 A（迁 Sheets）推荐，待确认 |
| P1-1 SyncIndicator UI | ✅ 已落地 | 新增 `SyncIndicator` 消费 `useSync()`，挂入 `SettingsNavPanel`（导航常驻） |
| P1-2 删 react-router-dom | ✅ 已落地 | `main.tsx` 去 `BrowserRouter`；`package.json` 移除依赖；grep 确认无引用 |
| P1-3 useSheetData effect 依赖 | ✅ 已落地 | 用 `configKey`（内容序列化）替代 headers 等对象引用作依赖，消除无限重载脚枪 |
| P1-4 ErrorBoundary + 空值兜底 | ✅ 已落地 | 新增全局 `ErrorBoundary` 包裹每个 editor；`MaterialInfo` 的 `price/name/code/category` 加空值兜底 |
| P1-5 批量改 batchUpdate | ✅ 已落地 | `sheets-core` 增 `appendRows`/`batchUpdateRows`（一次请求多行）；`useSheetData` 增 `batchAdd`/`batchUpdate`；调用点已切换 |
| P2-1 魔法数字 | ✅ 已落地 | `db.ts` 提 `MAX_SHEET_ROWS=10000` 常量 |
| P2-2 Set→string[] | ✅ 已落地 | `planStore.selectedIds` 改 `string[]`；`TaskList` 同步 `.includes()` |
| P2-3 setter as any | ✅ 已落地 | 重构为映射类型 setter（见 `planStore` 现状） |
| P2-4 主题 3 套手动同步 | 🟡 留待后续 | 属设计系统重构，本轮未动（风险低但改动面大） |
| P2-5 废弃包删除 | 📄 出文档 | 见 [[topics/topic-deprecate-legacy-packages]]，待确认后归档/删除 |
| P2-6 docs/ 三份 ingest | 🟡 未做 | 知识库自荐回路未闭，下次顺手做 |

**验证**：`npm run typecheck` 全绿；`npm run test` 69/69 通过（14 文件）。
**遗留噪声**：测试环境有 5 个 `AbortError` unhandled rejection（jsdom 卸载时中断外部资源加载），零应用帧、非本次改动引入、不影响测试/产物，已确认与 P0/P1/P2 无关。

## 关联
- 相关实体: [[entities/product-zustand]], [[entities/product-react]], [[entities/product-google-sheets-api]], [[entities/product-dockview]]
- 相关概念: [[concepts/concept-erp-module-architecture]], [[concepts/concept-offline-sync-conflict]], [[concepts/concept-erp-ux-patterns]]
- 参见: [[topics/topic-project-architecture]], [[topics/topic-pitfalls-guide]], [[topics/topic-design-system]]

## 引用来源
- [1] 代码实况: `apps/sino-purchase-v2/src/{App.tsx,main.tsx,app/stores/planStore.ts,app/stores/materialStore.ts,pages/PlanManagement.tsx,pages/MaterialInfo.tsx,theme/theme.ts}`
- [2] 代码实况: `packages/sheets-core/src/{db.ts,sync-queue.ts}`、`packages/sheets-react/src/{useSheetData.ts,useSync.tsx,SheetsProvider.tsx}`
- [3] 标准: [[concepts/concept-erp-module-architecture]]、[[concepts/concept-offline-sync-conflict]]

## 变更记录
- 2026-07-08: 初始创建，来源代码实况对账 + 知识库标准页
