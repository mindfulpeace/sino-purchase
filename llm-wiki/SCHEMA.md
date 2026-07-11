# LLM Wiki 规则配置（SCHEMA）

> 本文件定义 `llm-wiki/` 知识库的运行规则。最后更新：2026-07-08

## 定位
为 **sino-purchase-v2** 项目服务的开发参考知识库，覆盖三类内容：
1. **库参考**：项目所用第三方库（含版本、官方文档、demo 用法、API），用于开发中快速查阅
2. **行业规范**：ERP 软件常用技巧与对应功能的专业解决方案
3. **项目经验**：本项目踩坑、修复、设计决策与避坑指南

## 目录结构
```
llm-wiki/
├── raw/        ← 原始素材（只读，初次由专家编译沉淀；用户后续可投放新资料）
├── wiki/       ← 编译层（实体/概念/主题）
│   ├── index.md
│   ├── log.md
│   ├── entities/   ← 库、产品等实体（product-*.md）
│   ├── concepts/   ← ERP 规范、方法论等概念
│   └── topics/     ← 项目架构、避坑、设计系统等主题
└── SCHEMA.md   ← 本文件
```

## 页面模板（强制）
每个 wiki 页面必须含：`类型(entity|concept|topic)`、创建/更新时间、来源 `[[raw/xxx]]`、摘要、详情、关联、引用来源、变更记录。

## 命名与链接
- 页面文件名 `kebab-case`
- wiki 内部链接用 `[[相对路径，不带 .md]]`，如 `[[entities/product-mui]]`、`[[concepts/concept-erp-ux-patterns]]`
- raw 引用用 `[[raw/xxx]]`

## 质量规则
- **不臆造**：内容须来自 `raw/` 或明确标注的 AI 推理（🟡 标记）
- **必引用**：每个知识点标注来源 `[[raw/xxx]]`；联网抓取标注官方 URL
- **标矛盾**：不同来源冲突时用 `> ⚠️ 矛盾标注` 引用块
- **增量更新**：更新页面保留历史，追加新内容并在变更记录注明

## 可信度标记
- ✅ 已核验（官方文档/项目实测）
- 🟡 专家编译，建议人工核对（多为版本敏感或常识性内容）

## 操作纪律
- `raw/` 只读，不修改原始素材
- 每次 ingest 后更新 `index.md` 与 `log.md`
- 所有页面必须出现在 `index.md`

## 本项目上下文（供查询时参考）
- 栈：React 19 + Vite 8 + TypeScript 6 + MUI 9 + Emotion 11 + dockview 6.6 + Zustand 5
- 数据源：Google Sheets API v4（OAuth GSI，fetch 直连）
- 界面语言：全程中文；品牌名保留英文
