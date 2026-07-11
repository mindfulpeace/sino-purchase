# Zustand v5

> **类型**: entity
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/lib-zustand-v5]]
> **版本**: zustand = 5.0.14

## 摘要
Zustand 是极简的状态管理库。v5 仅保留具名导出、推荐 `useShallow` 做浅比较，并提供 `persist`/`subscribeWithSelector`/`immer` 等中间件。本项目用 Zustand 按业务拆分 store（plan/accounting/material/payment/docSettings）。

## 详情

### 创建 Store（柯里化推断类型）
```ts
import { create } from 'zustand'
interface State { count: number; inc: () => void }
export const useStore = create<State>()((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}))
```

### 选择器浅比较
```ts
import { useShallow } from 'zustand/react/shallow'
const { a, b } = useStore(useShallow((s) => ({ a: s.a, b: s.b })))
```
> 旧 `createWithEqualityFn` 默认浅比较已迁移到 `zustand/traditional`。

### 中间件
- `persist`（localStorage 持久化）、`subscribeWithSelector`、`immer`、`combine`、`devtools`
```ts
import { persist } from 'zustand/middleware'
create<State>()(persist((set) => ({...}), { name: 'sino-key' }))
```

### 本项目真实用法
- `apps/sino-purchase-v2/src/app/stores/materialStore.ts`：
  ```ts
  export const useMaterialStore = create<MaterialState>()(
    persist((set) => ({...}), { name: 'sino-materials' }),
  )
  ```
- 使用 `persist` 的 store：paymentStore、docSettingsStore、materialStore
- `planStore.applyFilter()` 在每次 setter 内合并调用，避免两次 `set`（AGENTS.md）

## 关联
- 相关实体: [[entities/product-react]]
- 参见: [[topics/topic-project-architecture]]

## 引用来源
- [1] [[raw/lib-zustand-v5]] — 官方 reference（联网抓取）
- [2] https://zustand.docs.pmnd.rs/reference/index

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/lib-zustand-v5]]
