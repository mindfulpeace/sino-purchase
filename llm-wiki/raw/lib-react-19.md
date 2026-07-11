# 原始素材：React 19 应用开发者变更

> 来源：https://react.dev/blog/2024/12/05/react-19 （联网抓取，2026-07-08）
> 可信度：✅ 已核验（React 官方博客）

## ref 作为 prop（函数组件）
- 函数组件可直接接收 `ref` prop，无需 `forwardRef`
```jsx
function MyInput({ placeholder, ref }) {
  return <input placeholder={placeholder} ref={ref} />
}
```
- `forwardRef` 进入弃用路线，新代码应避免使用

## Ref 清理函数
- ref 回调可返回清理函数，卸载时自动调用
```jsx
<input ref={(ref) => { /* setup */ return () => { /* cleanup */ } }} />
```
- TypeScript 陷阱：之前 `ref={current => (instance = current)}` 隐式返回会报错 → 改为块级 `ref={current => { instance = current; }}`

## 新 Hook
- `useOptimistic`：乐观更新，请求期间展示预期状态
- `useActionState`：替代 `useFormState`，返回 `[error, submitAction, isPending]`
- `use`：渲染中读取 Promise（自动 Suspend）或 Context（支持条件调用）

## 表单 Actions
- `<form>/<input>/<button>` 的 `action` / `formAction` 支持函数，提交后自动重置表单（非受控）
- `useFormStatus` 读取父 `<form>` 状态（如 `pending`）

## 破坏性变更
- ref 回调隐式返回非清理函数 → TS 报错
- `useFormState` 重命名 `useActionState`
- 卸载 ref 调用 `null` 将弃用（改用清理函数）

## 本项目现状
- 项目使用 React 19.2.7，dockview 要求 `react >= 16.8.0` 作为 peer，兼容
- 组件库 `components/ui` 提供 MUI 兼容 API，可借机评估弃用 `forwardRef`
