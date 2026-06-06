export interface BaseRecord {
  id: string
  createdAt: string
  updatedAt: string
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9)
}

export function nowISO(): string {
  return new Date().toISOString().slice(0, 10)
}
