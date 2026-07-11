# Wiki 索引

> 总页面数: 21（实体 10 + 概念 5 + 主题 6）｜ 原始素材 7 ｜ 最后更新: 2026-07-08
> 规则见 [[../SCHEMA.md]]

## 按类型

### 实体 (10) — 第三方库 / 产品
- [[entities/product-mui]] — Material UI v9（slotProps 化、清除 system props）
- [[entities/product-react]] — React 19（ref 作为 prop、use、表单 action）
- [[entities/product-zustand]] — Zustand v5（create 柯里化、useShallow、persist）
- [[entities/product-dockview]] — Dockview 6.6（edge group、主题、序列化）
- [[entities/product-vite]] — Vite 8（构建/dev server，monorepo 入口）
- [[entities/product-papaparse]] — PapaParse 5（CSV 解析/导入）
- [[entities/product-monaco-editor]] — Monaco Editor 4.7（懒加载 SQL 编辑器）
- [[entities/product-emotion]] — Emotion 11（MUI v9 样式引擎）
- [[entities/product-tanstack-react-virtual]] — @tanstack/react-virtual 3（大表行虚拟化）
- [[entities/product-google-sheets-api]] — Google Sheets API v4（云端数据库、OAuth+fetch）

### 概念 (5) — ERP 行业规范
- [[concepts/concept-erp-module-architecture]] — 模块化架构、单一数据源、模块映射
- [[concepts/concept-erp-procurement-inventory]] — 采购流程、三单匹配、库存主数据
- [[concepts/concept-erp-financial-accounting]] — 财务核算、现金/应付、报销
- [[concepts/concept-erp-ux-patterns]] — 高密度交互、表格/批量/筛选/状态机
- [[concepts/concept-offline-sync-conflict]] — 离线优先、同步队列、冲突策略

### 主题 (6) — 本项目
- [[topics/topic-project-architecture]] — 架构总览（monorepo、Provider、stores）
- [[topics/topic-pitfalls-guide]] — 避坑与修复经验（P0/P1 + AGENTS 14 条）
- [[topics/topic-design-system]] — 设计系统/主题（Linear+Neo-Brutalism、令牌）
- [[topics/review-architecture-2026-07-08]] — 架构与写法审查报告（P0–P2 优化+改版草图）
- [[topics/topic-material-persistence-migration]] — P0-2 物料持久化迁移方案（待确认）
- [[topics/topic-deprecate-legacy-packages]] — 废弃包 desk-ui/ui-dock 删除方案（待确认）

## 原始素材（raw/）
- [[raw/lib-mui-v9]] / [[raw/lib-react-19]] / [[raw/lib-zustand-v5]] / [[raw/lib-dockview-v66]]
- [[raw/erp-modules-standards]] / [[raw/project-experience]] / [[raw/compiled-libs-reference]]

## 快速入口
- 开发中查库 API → 实体页
- 做功能想对标行业方案 → 概念页（ERP）
- 排错/踩坑 → [[topics/topic-pitfalls-guide]]
