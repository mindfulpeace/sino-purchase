import { useCallback } from "react"
import { parseTabData } from "./dataParser"
import { useAccounting } from "./AccountingContext"

export function useImportClipboard() {
  const { showImportDialog } = useAccounting()

  const importFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        throw new Error("剪贴板为空")
      }
      const parsed = parseTabData(text)
      if (parsed.length === 0) {
        throw new Error("未解析到有效数据")
      }
      showImportDialog({ records: parsed, source: "clipboard" })
    } catch (error) {
      throw error
    }
  }, [showImportDialog])

  return { importFromClipboard }
}
