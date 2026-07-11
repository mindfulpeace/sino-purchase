# ERP 软件常用交互模式（行业规范）

> **类型**: concept
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/erp-modules-standards]] + 专家编译
> **可信度**: 🟡 专家综合（行业常识）

## 摘要
ERP 是典型的"高密度业务操作"软件，交互设计围绕"表格、批量、筛选、状态机、快捷键"展开。本项目的 dockview 六区布局 + 表格内联编辑已契合这一范式。

## 详情

### 常见交互技巧与专业方案
| 场景 | 行业常规方案 | 本项目落点 |
|------|------------|-----------|
| 大表浏览 | 行虚拟化 + 固定表头 + 列冻结 | `@tanstack/react-virtual`（CashGrid/SheetsDataTab）✅ |
| 批量操作 | 行多选 + 工具栏批量动作 | 计划管理 FilterModals；可扩展批量删除/导出 |
| 快速筛选 | 多条件筛选抽屉 + 保存视图 | `planStore.applyFilter()` ✅ |
| 内联编辑 | 单元格双击编辑，失焦保存 | CashGrid 内联编辑 ✅ |
| 状态机 | 单据状态流转（草稿→提交→审批→完成） | 采购台账可引入状态字段 |
| 快捷键 | 跨模块导航、新建、保存 | dockview 拖拽；可补全局快捷键 |
| 多窗口对照 | 多 tab/分屏对照数据 | dockview 多 Group + 浮动 ✅ |
| 导入导出 | CSV 导入映射 + Excel 导出 | papaparse 导入 ✅；导出待补 |

### 设计原则
- **密度优先**：ERP 用户是高频专业用户，信息密度 > 留白美观（本项目 Neo-Brutalism + 紧凑布局契合）
- **操作可逆**：危险操作（删除/付款）需二次确认 + 撤销窗口
- **反馈即时**：保存/同步状态可见（本项目 sync queue 的 `failedCount` 提示 ✅）
- **一致心智模型**：导航栏/属性栏/底部面板的固定位置降低认知负荷（dockview 六区框架 ✅）

## 关联
- 相关实体: [[entities/product-dockview]], [[entities/product-tanstack-react-virtual]], [[entities/product-papaparse]]
- 相关概念: [[concepts/concept-erp-module-architecture]]
- 参见: [[topics/topic-design-system]], [[topics/topic-pitfalls-guide]]

## 引用来源
- [1] [[raw/erp-modules-standards]] — 模块功能
- [2] [[raw/project-experience]] — 本项目交互实现

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/erp-modules-standards]] + 专家编译
