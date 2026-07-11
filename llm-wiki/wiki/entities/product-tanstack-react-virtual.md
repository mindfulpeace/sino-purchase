# @tanstack/react-virtual 3

> **类型**: entity
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/compiled-libs-reference]]
> **版本**: @tanstack/react-virtual = 3.14.5
> ⚠️ 标注：专家编译，建议核对官方文档

## 摘要
react-virtual 提供行/列虚拟化，本项目用于 CashGrid 与 SheetsDataTab 的大表渲染，保留 `<table>` 语义与内联编辑的同时避免 DOM 线性膨胀。

## 详情

### 行虚拟化用法
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'
const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 36,
  overscan: 10,
})
// 渲染：顶部 spacer + 可视行（translateY）+ 底部 spacer
```
- 动态测高：`measureElement` 配合 `data-index` 实现不定高行
- 保留表格语义：在 `<table>` 内用虚拟行 + spacer 行撑高滚动区

### 本项目实践（p0-p1-fixes）
- CashGrid.tsx / SheetsDataTab.tsx 改用行虚拟化；顶部/底部 spacer 行 + `measureElement` 动态测高
- 保留表格语义与内联编辑，大表 DOM 不再线性膨胀

## 关联
- 相关实体: [[entities/product-mui]], [[entities/product-react]]
- 参见: [[topics/topic-pitfalls-guide]], [[concepts/concept-erp-ux-patterns]]

## 引用来源
- [1] [[raw/compiled-libs-reference]] — 专家编译 + p0-p1 修复记录
- [2] https://tanstack.com/virtual/latest

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/compiled-libs-reference]]
