# Monaco Editor（@monaco-editor/react）

> **类型**: entity
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/compiled-libs-reference]]
> **版本**: @monaco-editor/react = 4.7.0
> ⚠️ 标注：专家编译，建议核对官方文档

## 摘要
Monaco Editor 是 VS Code 同款编辑器，本项目用于 SQL/文本编辑场景。包体较大（~600KB），通过 `React.lazy` 分包，避免拖慢首屏。

## 详情

### 基本用法
```tsx
import { Editor } from '@monaco-editor/react'
<Editor
  height="100%"
  language="sql"
  value={value}
  onChange={(val) => setValue(val ?? '')}
  options={{ minimap: { enabled: false }, fontSize: 13 }}
/>
```

### 懒加载（本项目约定）
- 用 `React.lazy(() => import('@monaco-editor/react'))` 分包，首屏不加载
- 主题色随 MUI 暗/亮切换（通过 `theme` prop 或 `loader` 配置）

### 注意
- 需 CDN/本地加载 worker；离线环境需配置 `loader.config({ paths: { vs } })`
- 大文档下注意内存，编辑区置于 dockview 中央 tab

## 关联
- 相关实体: [[entities/product-react]], [[entities/product-mui]]
- 参见: [[topics/topic-project-architecture]]

## 引用来源
- [1] [[raw/compiled-libs-reference]] — 专家编译
- [2] https://www.npmjs.com/package/@monaco-editor/react

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/compiled-libs-reference]]
