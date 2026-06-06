import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react"
import type { Material } from "./types"

const STORAGE_KEY = "sino-materials"

// 示例初始数据
const INITIAL_MATERIALS: Material[] = [
  { id: "1", name: "钢材", code: "MAT-001", unit: "吨", price: 5500, category: "原材料", createdAt: "2024-06-01", updatedAt: "2024-06-01" },
  { id: "2", name: "铝材", code: "MAT-002", unit: "吨", price: 18000, category: "原材料", createdAt: "2024-06-01", updatedAt: "2024-06-01" },
  { id: "3", name: "螺丝 M8", code: "MAT-003", unit: "个", price: 0.15, category: "标准件", createdAt: "2024-06-01", updatedAt: "2024-06-01" },
]

function loadMaterials(): Material[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* empty */ }
  return INITIAL_MATERIALS
}

function saveMaterials(materials: Material[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials))
  } catch { /* empty */ }
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

interface MaterialContextValue {
  materials: Material[]
  addMaterial: (data: Omit<Material, "id" | "createdAt" | "updatedAt">) => void
  updateMaterial: (id: string, changes: Partial<Material>) => void
  deleteMaterial: (id: string) => void
}

const MaterialContext = createContext<MaterialContextValue | null>(null)

export function MaterialProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>(loadMaterials)

  const addMaterial = useCallback((data: Omit<Material, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString().slice(0, 10)
    const newMaterial: Material = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    setMaterials(prev => {
      const next = [...prev, newMaterial]
      saveMaterials(next)
      return next
    })
  }, [])

  const updateMaterial = useCallback((id: string, changes: Partial<Material>) => {
    const now = new Date().toISOString().slice(0, 10)
    setMaterials(prev => {
      const next = prev.map(m => 
        m.id === id ? { ...m, ...changes, updatedAt: now } : m
      )
      saveMaterials(next)
      return next
    })
  }, [])

  const deleteMaterial = useCallback((id: string) => {
    setMaterials(prev => {
      const next = prev.filter(m => m.id !== id)
      saveMaterials(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
  }), [materials, addMaterial, updateMaterial, deleteMaterial])

  return (
    <MaterialContext.Provider value={value}>
      {children}
    </MaterialContext.Provider>
  )
}

export function useMaterial() {
  const context = useContext(MaterialContext)
  if (!context) {
    throw new Error("useMaterial must be used within a MaterialProvider")
  }
  return context
}
