import { createContext, useContext } from "react"
import type { PurchaseTask } from "../../modules/plan/types"

export interface PlanDataValue {
  tasks: PurchaseTask[]
  loading: boolean
  add: (data: Partial<PurchaseTask>) => void
  update: (id: string, changes: Partial<PurchaseTask>) => void
  remove: (id: string) => void
  reload: () => void
}

/**
 * P0-1：让 `useSheetData` 成为采购清单模块唯一的数据所有者。
 * PlanManagement 顶层调用一次 `useSheetData`，通过本 Context 把数据/CRUD 共享给
 * TaskItem / TaskDetail / FilterModals 等深层组件，store 不再持有数据副本、也不再注入 CRUD。
 */
export const PlanDataContext = createContext<PlanDataValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function usePlanData(): PlanDataValue {
  const ctx = useContext(PlanDataContext)
  if (!ctx) throw new Error("usePlanData must be used within <PlanDataContext.Provider>")
  return ctx
}
