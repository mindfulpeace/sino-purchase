import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Payment {
  id: string
  date: string
  supplier: string
  amount: number
  status: "pending" | "paid" | "cancelled"
  reference: string
  createdAt: string
  updatedAt: string
}

const INITIAL_PAYMENTS: Payment[] = [
  { id: "1", date: "2024-06-10", supplier: "钢铁供应商 A", amount: 55000, status: "paid", reference: "PAY-001", createdAt: "2024-06-10", updatedAt: "2024-06-10" },
  { id: "2", date: "2024-06-12", supplier: "铝材供应商 B", amount: 18000, status: "pending", reference: "PAY-002", createdAt: "2024-06-12", updatedAt: "2024-06-12" },
  { id: "3", date: "2024-06-15", supplier: "标准件供应商 C", amount: 1500, status: "pending", reference: "PAY-003", createdAt: "2024-06-15", updatedAt: "2024-06-15" },
  { id: "4", date: "2024-06-05", supplier: "运输公司 D", amount: 2000, status: "paid", reference: "PAY-004", createdAt: "2024-06-05", updatedAt: "2024-06-05" },
]

let counter = 4

interface PaymentState {
  payments: Payment[]
  addPayment: (data: Omit<Payment, "id" | "createdAt" | "updatedAt" | "reference">) => void
  updatePayment: (id: string, changes: Partial<Payment>) => void
  deletePayment: (id: string) => void
  confirmPayment: (id: string) => void
  cancelPayment: (id: string) => void
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      payments: INITIAL_PAYMENTS,

      addPayment: (data) => {
        counter++
        const now = new Date().toISOString().slice(0, 10)
        const newPayment: Payment = {
          ...data,
          id: String(counter),
          reference: `PAY-${String(counter).padStart(3, "0")}`,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ payments: [...s.payments, newPayment] }))
      },

      updatePayment: (id, changes) => {
        const now = new Date().toISOString().slice(0, 10)
        set((s) => ({
          payments: s.payments.map((p) => (p.id === id ? { ...p, ...changes, updatedAt: now } : p)),
        }))
      },

      deletePayment: (id) => set((s) => ({ payments: s.payments.filter((p) => p.id !== id) })),

      confirmPayment: (id) => {
        const now = new Date().toISOString().slice(0, 10)
        set((s) => ({
          payments: s.payments.map((p) => (p.id === id ? { ...p, status: "paid" as const, updatedAt: now } : p)),
        }))
      },

      cancelPayment: (id) => {
        const now = new Date().toISOString().slice(0, 10)
        set((s) => ({
          payments: s.payments.map((p) => (p.id === id ? { ...p, status: "cancelled" as const, updatedAt: now } : p)),
        }))
      },
    }),
    { name: "sino-payments" },
  ),
)
