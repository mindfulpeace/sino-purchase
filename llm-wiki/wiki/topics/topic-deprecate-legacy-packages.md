# 删除废弃包 desk-ui / ui-dock 方案（待确认）

> **类型**: topic (proposal)
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[topics/review-architecture-2026-07-08]] P2-5 + AGENTS.md + 依赖清点
> **可信度**: ✅ 基于 package.json / AGENTS.md 核对；方案为 AI 综合建议，待用户拍板后落地

## 摘要
`packages/desk-ui`、`packages/ui-dock` 已在 AGENTS.md 标 DEPRECATED（由 `layout-dock` 替代），但仍在 monorepo 中带 `dist/`，增加误引与构建开销。本文给出最小删除方案，确保零回归。

## 现状核对
- `AGENTS.md`：`desk-ui`(遗留布局库, DEPRECATED)、`ui-dock`(dockview 布局库 v1, DEPRECATED) 均由 `layout-dock` 替代。
- 依赖清点（grep `@sino-purchase/ui-dock` / `@sino-purchase/desk-ui`）：**主应用与所有 package 均无源码引用**（仅 AGENTS.md 文档提及）。
- 根 `package.json` 的 `workspaces` 已排除这两个包（确认未被 workspace 解析）。

## 删除步骤（最小风险）
1. **确认无引用**：运行 `grep -rn "@sino-purchase/ui-dock|@sino-purchase/desk-ui" apps packages --include="*.ts" --include="*.tsx" --include="*.json"`，应为空（仅 AGENTS.md 文档）。
2. **归档而非硬删**（稳妥）：移到 `archive/desk-ui`、`archive/ui-dock`，保留历史可追溯；或直接在 git 中删除。
3. **清理 AGENTS.md / 知识库**：把 DEPRECATED 说明改为"已删除/已归档"，并更新 `[[topics/topic-project-architecture]]` 的包清单。
4. **构建验证**：`npm run build` 全量构建，确认无 `Cannot find module '@sino-purchase/...'` 报错。

## 风险点
- `ui-dock` 曾含 `title/headerRight/statusBar/HeaderToggles` 等 `layout-dock` 当前**尚未合并**的功能（AGENTS.md 注明"后续计划合并回 layout-dock"）。删除前确认这些功能无业务依赖；若有，先迁移到 layout-dock 或保留 ui-dock 对应模块。
- 若任何 demo app（`apps/demo-ui`）仍引用 ui-dock，先切到 layout-dock。

## 关联
- 参见: [[topics/review-architecture-2026-07-08]] (P2-5)、[[topics/topic-project-architecture]]
- 相关实体: [[entities/product-dockview]]

## 引用来源
- [1] 代码实况: 根 `package.json` workspaces、AGENTS.md
- [2] 标准: [[topics/topic-project-architecture]]

## 变更记录
- 2026-07-08: 初始创建，来源审查 P2-5，待用户确认后执行删除/归档
