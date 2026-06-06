import { useCallback, useRef } from "react"
import { importFromExcel } from "./sheetjs"
import { useAccounting } from "./AccountingContext"

export function useImportExcel() {
  const { showImportDialog } = useAccounting()
  const inputRef = useRef<HTMLInputElement>(null)

  const triggerImport = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const records = await importFromExcel(file)
      if (records.length === 0) {
        throw new Error("Excel 文件未解析到数据")
      }
      showImportDialog({ records, source: "excel" })
    } catch (error) {
      throw error
    } finally {
      e.target.value = ""
    }
  }, [showImportDialog])

  return { triggerImport, inputRef, handleFileChange }
}
