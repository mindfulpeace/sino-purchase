# 变更日志

## 2026-07-08 — 知识库初始化
- ✨ 新增: 目录结构 `llm-wiki/{raw,wiki,SCHEMA.md}`
- ✨ 新增: 原始素材 7 份（mui-v9 / react-19 / zustand-v5 / dockview-v66 / erp-modules-standards / project-experience / compiled-libs-reference）
- ✨ 新增: 实体页 10（库参考：mui、react、zustand、dockview、vite、papaparse、monaco-editor、emotion、tanstack-react-virtual、google-sheets-api）
- ✨ 新增: 概念页 5（ERP 规范：module-architecture、procurement-inventory、financial-accounting、ux-patterns、offline-sync-conflict）
- ✨ 新增: 主题页 3（project-architecture、pitfalls-guide、design-system）
- 🔗 链接: 实体 ↔ 概念 ↔ 主题 已建交叉引用（库页链项目架构，ERP 概念链项目避坑）
- ⚠️ 矛盾: 标注 3 处
  - [[concepts/concept-erp-procurement-inventory]] — 本项目采购台账不回写库存（与行业"收货即更新库存"不一致）
  - [[concepts/concept-erp-financial-accounting]] — 本项目单式现金流水（与行业复式记账不一致，属有意简化）
  - [[topics/topic-design-system]] — 废弃的"透明 Portal"方案（勿复用，以主题令牌为准）
- 🟡 标注: vite / papaparse / monaco / emotion / tanstack-virtual / google-sheets-api 部分细节为专家编译，建议人工核验官方文档

## 待办（Lint 建议）
- 后续可补概念页：ERP 订单管理、报表与 BI、权限/多租户
- 建议把 `docs/dockview-research.md`、`docs/p0-p1-fixes-2026-07-06.md` 作为新 raw 投放并增量 ingest
- 计划管理模块做状态机（草稿→提交→完成）可补一篇 topic

## 2026-07-08 — 架构与写法审查（Lint/Query 融合）
- ✨ 新增: [[topics/review-architecture-2026-07-08]] — 对照知识库标准逐文件核对源码，产出 P0–P2 优化清单 + 改版草图
- 🔍 审查结论（对账要点）:
  - 🟢 保留: 离线同步链路（isRetryableStatus + SyncProvider 重连排空）、id→行号缓存、theme.ts 令牌单一来源、lazy 分包
  - 🔴 P0-1: [[entities/product-zustand]] 反模式 — planStore 数据副本 + setCrudActions CRUD 注入（双重数据源）
  - 🔴 P0-2: materialStore 用 localStorage，与其余 Google Sheets 持久化范式分裂
  - 🟡 P1-1: [[concepts/concept-offline-sync-conflict]] 要求"失败可见"，但 useSync/failedCount 主应用未接入 UI
  - 🟡 P1-2: 主应用 react-router-dom 死依赖（无 Routes）
  - 🟡 P1-3: useSheetData effect 依赖脚枪（当前靠模块常量侥幸安全）
  - 🟡 P1-4: 无 ErrorBoundary；MaterialInfo price 可能 undefined 崩溃
  - 🟡 P1-5: 批量更新逐条顺序写云端
  - 🟢 P2: 魔法数字/Set 状态/as any/主题 3 套手动/废弃包未删/docs 未 ingest
- 🔧 修正误判: 离线队列"重连自动排空"实为已接好（SyncProvider 挂载于 SheetsProvider 内），非缺陷

## 2026-07-08 — 处理 P0/P1/P2（代码落地）
> 用户选择"全部落地代码"；P0-2 与废弃包删除属高风险架构改动，按约定出文档、待确认后落地。

### ✅ 已落地（代码）
- ✨ 新增: [[topics/topic-project-architecture]] 相关 — `PlanDataContext` 作为计划数据唯一 owner（P0-1）
- 🔧 重构: `planStore` 删除数据副本(allTasks)与 `setCrudActions` 注入桩，仅留过滤/UI/派生（P0-1）
- 📝 更新: `PlanManagement`/`TaskItem`/`TaskDetail`/`FilterModals`/`SettingsDialog`/`TaskList` 改消费 `usePlanData()`；3 测试重写经 DOM 断言（P0-1）
- ✨ 新增: `SyncIndicator` 组件消费 `useSync()`，挂入 `SettingsNavPanel`（P1-1）
- 🗑️ 删除: `main.tsx` 的 `BrowserRouter`、`package.json` 的 `react-router-dom` 死依赖（P1-2）
- 🔧 加固: `useSheetData` effect 依赖改用 `configKey`(内容序列化)，消除无限重载脚枪（P1-3）
- ✨ 新增: `ErrorBoundary` 包裹每个 editor；`MaterialInfo` 空值兜底（P1-4）
- ✨ 新增: `sheets-core` 增 `appendRows`/`batchUpdateRows`；`useSheetData` 增 `batchAdd`/`batchUpdate`；调用点切换（P1-5）
- 🔧 清理: `db.ts` 提 `MAX_SHEET_ROWS` 常量（P2-1）；`planStore.selectedIds` 改 `string[]`（P2-2）；setter 改映射类型去 `as any`（P2-3）

### 📄 出文档、待确认后落地
- 📄 新增: [[topics/topic-material-persistence-migration]] — P0-2 物料持久化迁移方案（路线 A 迁 Sheets 推荐）
- 📄 新增: [[topics/topic-deprecate-legacy-packages]] — 废弃包 desk-ui/ui-dock 删除方案

### ✅ 验证
- `npm run typecheck` 全绿；`npm run test` 69/69 通过（14 文件）
- 🟡 遗留: 测试环境 5 个 `AbortError` unhandled rejection（jsdom 卸载中断外部资源，零应用帧，非本次改动、不影响产物）

## 2026-07-08 — 健康巡检（Lint）
- 🔍 范围：21 内容页 + 7 原始素材 + index/log/SCHEMA
- ✅ 链接图健康：21 个内容页全部被其他内容页引用（含 log），**无孤立页**；所有 `[[wiki link]]` 目标均存在，**无断链**
- 🔧 修复: [[wiki/index.md]] 主题计数过期「(3)」→「(6)」（实际 6 个主题页）
- ⚠️ 新增矛盾标注: [[concepts/concept-erp-module-architecture]] — `materialStore` 用 localStorage 与"单一数据源"原则分裂（P0-2，待确认迁移 Sheets）
- 📌 已知数据缺口（首轮 Lint 建议遗留，仍待补）：ERP 订单管理 / 报表与 BI / 权限多租户 概念页缺失；`docs/` 下 3 份调研文档未作为 raw 增量 ingest；计划管理状态机（草稿→提交→完成）topic 未写
- 🟡 待核验：product-vite / product-papaparse / product-monaco-editor / product-emotion / product-tanstack-react-virtual / product-google-sheets-api 为专家编译，标 🟡 待核验，建议人工核对官方文档
- 💡 建议：把 `docs/dockview-research.md`、`docs/p0-p1-fixes-2026-07-06.md` 等作为新 raw 投放并增量 ingest，可补"开发调研"类主题，提升库内知识密度
