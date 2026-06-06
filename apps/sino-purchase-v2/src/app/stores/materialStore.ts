import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Material } from "../../modules/material/types"
import { generateId, nowISO } from "../../shared/types"

const INITIAL_MATERIALS: Material[] = [
  { id: "1", name: "钢材", code: "MAT-001", unit: "吨", price: 5500, category: "原材料", createdAt: "2024-06-01", updatedAt: "2024-06-01" },
  { id: "2", name: "铝材", code: "MAT-002", unit: "吨", price: 18000, category: "原材料", createdAt: "2024-06-01", updatedAt: "2024-06-01" },
  { id: "3", name: "螺丝 M8", code: "MAT-003", unit: "个", price: 0.15, category: "标准件", createdAt: "2024-06-01", updatedAt: "2024-06-01" },
]

interface MaterialState {
  materials: Material[]
  addMaterial: (data: Omit<Material, "id" | "createdAt" | "updatedAt">) => void
  updateMaterial: (id: string, changes: Partial<Material>) => void
  deleteMaterial: (id: string) => void
}

export const useMaterialStore = create<MaterialState>()(
  persist(
    (set) => ({
      materials: INITIAL_MATERIALS,

      addMaterial: (data) => {
        const newMaterial: Material = { ...data, id: generateId(), createdAt: nowISO(), updatedAt: nowISO() }
        set((s) => ({ materials: [...s.materials, newMaterial] }))
      },

      updateMaterial: (id, changes) => {
        set((s) => ({
          materials: s.materials.map((m) => (m.id === id ? { ...m, ...changes, updatedAt: nowISO() } : m)),
        }))
      },

      deleteMaterial: (id) => set((s) => ({ materials: s.materials.filter((m) => m.id !== id) })),
    }),
    { name: "sino-materials" },
  ),
)
