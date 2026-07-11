# 项目架构总览（sino-purchase-v2）

> **类型**: topic
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/project-experience]]
> **可信度**: ✅ 来自 AGENTS.md / 代码审计（项目实测）

## 摘要
本项目是铜矿采购台账工具：React 19 + Vite 8 monorepo，UI 用 MUI 9 + dockview 六区框架，状态用 Zustand 按业务拆分，数据持久化到 Google Sheets（OAuth + fetch 直连，离线优先）。

## 详情

### 技术栈
| 层 | 选型 |
|----|------|
| UI 框架 | React 19.2.7 + TypeScript 6 |
| 构建 | Vite 8.0.16（monorepo, npm workspaces） |
| 组件库 | MUI 9.2.0（Emotion 11 引擎） |
| 布局 | dockview 6.6.1（封装 @sino-purchase/layout-dock） |
| 状态 | Zustand 5.0.14 |
| 数据源 | Google Sheets API v4（fetch 直连） |
| 编辑器 | Monaco 4.7.0（懒加载） |
| CSV | papaparse 5.5.3 |

### 目录结构（monorepo）
```
packages/
  layout-dock/    dockview 六区框架（导航/编辑/右栏/底部）
  sheets-core/    认证/DB/同步队列（无 React）
  sheets-react/   React 绑定（Provider/useAuth/useSheetData/useSync）
  doc-reimburse/  费用报销单组件（doc-utils/amountToWord 中文大写）
  print/          A4 打印
  utils/diff/...  通用工具
apps/sino-purchase-v2/  主应用（stores/modules/pages）
```

### 关键设计决策
- **Provider 嵌套**：`ThemeProvider > SheetsProvider > DockLayout`
- **状态拆分**：`app/stores/` 按业务（plan/accounting/material/payment/docSettings）；`planStore.applyFilter()` 在 setter 内合并调用避免两次 `set`
- **页面薄包装**：`pages/` 组合 `stores` + `modules/`；模块按业务拆组件与 hooks
- **懒加载**：5 个页面 `React.lazy` 分包，首屏不加载 Monaco(~600KB)/xlsx(~416KB)
- **布局命名**：标题栏 `.hdr`(26px) / 导航栏 `.nav`(48px) / 编辑区 `.editor` / 属性栏 `.right` / 底部 `.panel` / 状态栏 `.status`
- **打印**：面板内容用 `.layout-dock-{left|center|right|bottom}` 包裹，仅 `.layout-dock-right` 可打印

## 关联
- 相关实体: [[entities/product-react]], [[entities/product-mui]], [[entities/product-dockview]], [[entities/product-zustand]], [[entities/product-google-sheets-api]]
- 相关概念: [[concepts/concept-erp-module-architecture]], [[concepts/concept-offline-sync-conflict]]
- 参见: [[topics/topic-design-system]], [[topics/topic-pitfalls-guide]]

## 引用来源
- [1] [[raw/project-experience]] — AGENTS.md + 审计报告
- [2] [[raw/erp-modules-standards]] — 模块映射

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/project-experience]]
