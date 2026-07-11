import { Box, Icon, IconNames, Spinner, Tooltip } from "./ui"
import { useSync } from "@sino-purchase/sheets-react"
import { queueLen } from "@sino-purchase/sheets-core"

/**
 * 同步状态指示器（P1-1）。
 * 消费 sheets-react 的 useSync()，把原本只在 demo 应用可见的失败/待同步状态
 * 暴露到主应用导航面板，满足 ERP「写操作失败必须可见」的可用性要求。
 */
export function SyncIndicator() {
  const { status, failedCount, retry } = useSync()
  const pending = queueLen()

  if (status === "syncing") {
    return (
      <Box className="dv-panel-item" style={{ cursor: "default", gap: 6 }}>
        <Spinner size={12} />
        <span>同步中…</span>
      </Box>
    )
  }

  if (status === "unsynced") {
    return (
      <Tooltip content={`${pending} 项待同步，点击立即重试`}>
        <Box
          className="dv-panel-item"
          style={{ cursor: "pointer", gap: 6, color: "var(--warn)" }}
          onClick={() => void retry()}
        >
          <Icon icon={IconNames.REFRESH} size={14} />
          <span>待同步 {pending} 项</span>
        </Box>
      </Tooltip>
    )
  }

  // synced —— 若曾有写操作因永久错误被丢弃，显示失败计数
  if (failedCount > 0) {
    return (
      <Tooltip content={`${failedCount} 项写操作同步失败（可能为 4xx 永久错误），请检查数据`}>
        <Box
          className="dv-panel-item"
          style={{ cursor: "default", gap: 6, color: "var(--danger)" }}
        >
          <Icon icon={IconNames.CROSS} size={14} />
          <span>{failedCount} 项失败</span>
        </Box>
      </Tooltip>
    )
  }

  return (
    <Tooltip content="数据已与 Google Sheets 云端同步">
      <Box className="dv-panel-item" style={{ cursor: "default", gap: 6, color: "var(--text-dim)" }}>
        <Icon icon={IconNames.TICK} size={14} />
        <span>已同步</span>
      </Box>
    </Tooltip>
  )
}
