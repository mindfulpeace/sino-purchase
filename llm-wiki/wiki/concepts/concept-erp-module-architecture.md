# ERP 模块化架构（行业规范）

> **类型**: concept
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/erp-modules-standards]]
> **可信度**: ✅ 模块定义来自 NetSuite；🟡 解决方案为专家综合

## 摘要
成熟的 ERP 以"单一中央数据库 + 可插拔模块"为基石：财务、采购、库存、订单等模块共享同一数据源，保证全公司数据一致，并随业务按需扩展。

## 详情

### 核心原则
1. **单一数据源（Single Source of Truth）**：所有模块写入同一库，避免孤岛与对账
> ⚠️ 矛盾标注：本原则要求"所有模块写入同一库"，但本项目 `materialStore`（物料主数据）当前使用 `localStorage`，与计划/记账/报销等模块的 Google Sheets 持久化范式分裂，形成第二个数据源。详见 [[topics/topic-material-persistence-migration]]（P0-2，待确认迁移至 Sheets）。
2. **模块解耦但数据贯通**：模块间通过共享主数据（物料、供应商、客户、科目）联动
3. **渐进式采用**：先上财务/采购，后续补库存/订单，不推倒重来
4. **统一主数据管理**：物料编码、供应商档案、科目表等作为跨模块基础

### 常规模块划分
| 模块 | 作用 | 本项目对应 |
|------|------|-----------|
| 采购管理 | RFQ→PO→收货 | 计划管理（采购台账） |
| 库存/物料 | SKU 主数据、出入库 | 物料信息（占位） |
| 应付/现金 | 付款、对账、现金日记账 | 记账报销、往来付款 |
| 订单管理 | 接单→交付 | 暂未涉及 |
| 财务总账 | GL、报表 | 部分（记账报销导出） |

### 专业解决方案（映射到本项目）
- **主数据先行**：先用 `materialStore` 建物料主数据（编码/单位/分类），采购单引用而非内联 —— 避免"同一物料多种写法"
- **模块间联动**：采购收货 → 自动更新库存水平（行业惯例）；本项目目前采购与库存尚未打通，建议后续用事件/共享 store 联动
- **统一 ID 策略**：所有实体用 `generateId()` 生成稳定 id，云端用 `rowMap`(id→行号) 回写（见 [[concepts/concept-offline-sync-conflict]]）

## 关联
- 相关实体: [[entities/product-google-sheets-api]]
- 相关概念: [[concepts/concept-erp-procurement-inventory]], [[concepts/concept-erp-financial-accounting]]
- 参见: [[topics/topic-project-architecture]]

## 引用来源
- [1] [[raw/erp-modules-standards]] — NetSuite ERP 模块文章
- [2] https://www.netsuite.com/portal/resource/articles/erp/erp-modules.shtml

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/erp-modules-standards]]
- 2026-07-08: 增补 ⚠️ 矛盾标注 — materialStore 用 localStorage 与"单一数据源"原则分裂（见 [[topics/topic-material-persistence-migration]]）
