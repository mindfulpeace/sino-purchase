import type { BaseRecord } from "../../shared/types"

export interface Material extends BaseRecord {
  name: string
  code: string
  unit: string
  price: number
  category: string
}
