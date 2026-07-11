# React 19

> **类型**: entity
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/lib-react-19]]
> **版本**: react / react-dom = 19.2.7

## 摘要
React 19 主要让函数组件可直接接收 `ref` prop（不再强制 `forwardRef`），ref 回调支持清理函数，并新增 `useOptimistic`/`useActionState`/`use` 与表单 action 支持。本项目基于 React 19 + Vite 8 构建。

## 详情

### 关键变更（应用开发者）
- **ref 作为 prop**：函数组件直接 `function MyInput({ ref }) {}`，无需 `forwardRef`（class 组件 ref 仍指向实例）
- **ref 清理函数**：ref 回调可返回清理函数，卸载时调用
  ```tsx
  <input ref={(el) => { /* setup */; return () => { /* cleanup */ } }} />
  ```
- **新 Hook**：`useOptimistic`（乐观更新）、`useActionState`（返回 `[error, action, isPending]`）
- **`use`**：渲染中读 Promise（自动 Suspend）或 Context（可条件调用）
- **表单 action**：`<form action={fn}>`、`<button formAction={fn}>`，提交后自动重置非受控表单

### TypeScript 注意
- ref 回调隐式返回非清理值会报错 → 用块级写法：`ref={(el) => { instance = el; }}`
- `forwardRef` 进入弃用路线，新代码避免

## 关联
- 相关实体: [[entities/product-mui]], [[entities/product-dockview]], [[entities/product-zustand]]
- 参见: [[topics/topic-project-architecture]]

## 引用来源
- [1] [[raw/lib-react-19]] — react.dev 官方博客（联网抓取）
- [2] https://react.dev/blog/2024/12/05/react-19

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/lib-react-19]]
