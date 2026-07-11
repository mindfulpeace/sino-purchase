# 原始素材：Zustand v5 API

> 来源：https://zustand.docs.pmnd.rs/reference/index （联网抓取，2026-07-08）+ 专家编译
> 可信度：✅ 已核验核心 API；🟡 部分细节为专家编译

## 创建 Store
- 仅具名导出：`import { create } from 'zustand'`（默认导入已在 v4 移除）
- 推断类型用柯里化写法：`create<T>()(set => ...)`

```ts
import { create } from 'zustand'

interface State {
  count: number
  inc: () => void
}
export const useStore = create<State>()((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}))
```

## 选择器与浅比较
- `useShallow` 替代 v4 的 `createWithEqualityFn` 默认浅比较
- `import { useShallow } from 'zustand/react/shallow'`
- 旧 equality-fn 写法迁移到 `zustand/traditional` 的 `createWithEqualityFn`

```ts
import { useShallow } from 'zustand/react/shallow'
const { a, b } = useStore(useShallow((s) => ({ a: s.a, b: s.b })))
```

## 中间件
- `persist`：`zustand/middleware`，持久化到 localStorage 或自定义 storage
- `subscribeWithSelector`：按切片订阅
- `immer`：可变语法写更新
- `combine`：合并 state 切片并推断类型
- `devtools`：接 Redux DevTools

```ts
import { persist } from 'zustand/middleware'
create<State>()(persist((set) => ({...}), { name: 'sino-key' }))
```

## v5 Breaking
- 移除默认导出
- 需要 React 18+（本项目 React 19 ✓）
- `useShallow` 成为浅比较推荐方式

## 本项目现状
- 真实用法：`apps/sino-purchase-v2/src/app/stores/materialStore.ts`
  `create<MaterialState>()(persist((set) => ({...}), { name: "sino-materials" }))`
- 使用 persist 的 store：paymentStore、docSettingsStore、materialStore
- 所有 store 统一 `import { create } from 'zustand'`
