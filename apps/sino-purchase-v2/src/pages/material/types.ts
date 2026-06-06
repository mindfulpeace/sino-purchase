export interface Material {
  id: string
  name: string
  code: string
  unit: string
  price: number
  category: string
  createdAt: string
  updatedAt: string
}

export const MATERIAL_HEADERS = ["id", "name", "code", "unit", "price", "category"] as const
