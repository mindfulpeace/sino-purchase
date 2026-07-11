# 物料持久化迁移方案（P0-2，待确认）

> **类型**: topic (proposal)
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[topics/review-architecture-2026-07-08]] P0-2 + 代码实况 `materialStore.ts` / `PlanManagement.tsx`
> **可信度**: ✅ 基于源码核对；方案为 AI 综合建议，待用户拍板后落地

## 摘要
`materialStore` 用 `zustand/persist` 落 `localStorage`，而 plan/accounting 走 `useSheetData`→Google Sheets。两套路、两套 API，物料主数据无法跨设备、无冲突处理、无离线同步。本文给出两条迁移路线，均**不破坏现有功能**，待确认后落地。

## 现状核对
- `materialStore.ts`：`create<T>()(persist(...))`，字段含 `materials: Material[]`、查询/筛选态、CRUD 桩。
- `MaterialInfo.tsx`：消费 `materialStore`，表格渲染 + 搜索；`price.toLocaleString()` 已加空值兜底（P1-4）。
- plan/accounting：`useSheetData<PurchaseTask>({ sheetName: "tasks"/"cash", ... })` + 离线同步队列。

## 路线 A（推荐）：迁到 Google Sheets，与 plan/accounting 同范式
1. 新建 `materials` 表（或在现有 spreadsheet 增 sheet），表头对齐 `Material` 字段（name/code/category/brand/spec/unit/price/...）。
2. `MaterialInfo` 改为 `useSheetData<Material>({ sheetName: "materials", headers: MATERIAL_HEADERS, numericFields, demoData: DEMO_MATERIALS })`。
3. 删除 `materialStore` 的 `persist`，store 仅保留筛选/UI 态（与 P0-1 后的 planStore 同构）。
4. 复用已建的离线同步队列——物料写操作自动获得离线/冲突能力。

**收益**：单一数据源原则落地；物料与采购计划天然关联（同一 spreadsheet 可跨 sheet 引用）。
**代价**：首版无 demo 数据兜底需保证登录态；旧 localStorage 数据需一次性迁移（或保留导入按钮）。

## 路线 B：显式本地持久化，文档化为"有意选择"
若物料确为设备本地-only（如离线演示、无登录场景）：
1. 抽 `useLocalPersist<T>(key)` hook，封装 `zustand/persist`，并加 JSDoc 标注"本地-only，无跨设备同步"。
2. `materialStore` 改用该 hook，命名明确为 `*LocalStore`，避免与 Sheets store 混淆。

**收益**：保留离线可用性，消除"范式漂移"的歧义。
**代价**：仍两套持久化，需在 AGENTS.md / 设计系统页显式记录，防止后续模块误选。

## 推荐决策
优先路线 A（与 ERP 单一数据源原则 [[concepts/concept-erp-module-architecture]] 一致）。若担心登录门槛，可先用"路线 A + demo 数据兜底"过渡，再逐步去 demo。

## 关联
- 相关概念: [[concepts/concept-erp-module-architecture]], [[concepts/concept-offline-sync-conflict]]
- 相关实体: [[entities/product-google-sheets-api]], [[entities/product-zustand]]
- 参见: [[topics/review-architecture-2026-07-08]] (P0-2)

## 引用来源
- [1] 代码实况: `apps/sino-purchase-v2/src/app/stores/materialStore.ts`、`pages/MaterialInfo.tsx`
- [2] 标准: [[concepts/concept-erp-module-architecture]]

## 变更记录
- 2026-07-08: 初始创建，来源审查 P0-2，待用户确认路线后落地
