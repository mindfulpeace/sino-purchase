import { useState, useEffect } from "react"
import Button from "@mui/material/Button"
import ButtonGroup from "@mui/material/ButtonGroup"
import TextField from "@mui/material/TextField"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Divider from "@mui/material/Divider"
import FormControlLabel from "@mui/material/FormControlLabel"
import Switch from "@mui/material/Switch"
import CircularProgress from "@mui/material/CircularProgress"
import RefreshOutlined from "@mui/icons-material/RefreshOutlined"
import RestartAltOutlined from "@mui/icons-material/RestartAltOutlined"
import SaveOutlined from "@mui/icons-material/SaveOutlined"
import { usePlanStore } from "../../../app/stores/planStore"
import { todayISO } from "../helpers"

const STORAGE_KEY = "sino-exchange-rates"
const FETCH_INTERVAL = 24 * 60 * 60 * 1000

interface StoredRates { rates: { ZMW: number; USD: number; CNY: number }; timestamp: number; manualOverride: boolean }

function persistRates(rat: StoredRates) { localStorage.setItem(STORAGE_KEY, JSON.stringify(rat)) }

function fetchRates(): Promise<{ USD: number; CNY: number } | null> {
  return fetch("https://open.er-api.com/v6/latest/ZMW")
    .then(r => r.json())
    .then(data => {
      if (data.rates?.USD != null && data.rates?.CNY != null) {
        return {
          USD: Math.round((1 / data.rates.USD) * 100) / 100,
          CNY: Math.round((1 / data.rates.CNY) * 100) / 100,
        }
      }
      return null
    })
    .catch(() => null)
}

/**
 * 计划设置（右侧面板）：参考 v1 SettingsModal / v2 SettingsDialog 的功能。
 * - 默认汇率（USD→k、CNY→k），支持自动刷新与手动覆盖保存。
 * - 计划载入的起止日期区间（筛选计划清单）。
 * 与「批量操作」同属计划管理编辑器的两个右侧标签；布局与其他右侧面板统一（p:1.5 / spacing:1），
 * 组件全部使用 MUI，样式走 src/theme/theme.ts 中的设计令牌。
 */
export function PlanSettingsPanel() {
  const { dateStart, dateEnd, dateEndToday, setDateStart, setDateEnd, setDateEndToday } = usePlanStore()
  const [rates, setRates] = useState<StoredRates>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      if (s) return JSON.parse(s) as StoredRates
    } catch { /* empty */ }
    return { rates: { ZMW: 1, USD: 26, CNY: 3.6 }, timestamp: 0, manualOverride: false }
  })
  const [editUSD, setEditUSD] = useState(String(rates.rates.USD))
  const [editCNY, setEditCNY] = useState(String(rates.rates.CNY))
  const [loading, setLoading] = useState(false)

  // 首次进入且超过刷新间隔、且非手动覆盖时，自动拉取最新汇率
  useEffect(() => {
    if (rates.manualOverride) return
    if (Date.now() - rates.timestamp < FETCH_INTERVAL) return
    let cancelled = false
    setLoading(true)
    fetchRates().then(fetched => {
      if (cancelled || !fetched) return
      const next: StoredRates = { rates: { ZMW: 1, USD: fetched.USD, CNY: fetched.CNY }, timestamp: Date.now(), manualOverride: false }
      setRates(next); setEditUSD(String(fetched.USD)); setEditCNY(String(fetched.CNY)); persistRates(next)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [rates.manualOverride, rates.timestamp])

  function handleSaveRates() {
    const usd = Math.round(parseFloat(editUSD) * 100) / 100
    const cny = Math.round(parseFloat(editCNY) * 100) / 100
    if (usd > 0 && cny > 0) {
      const next: StoredRates = { rates: { ZMW: 1, USD: usd, CNY: cny }, timestamp: Date.now(), manualOverride: true }
      setRates(next); persistRates(next)
    }
  }

  function handleRefresh() {
    setLoading(true)
    fetchRates().then(fetched => {
      if (!fetched) return
      const next: StoredRates = { rates: { ZMW: 1, USD: fetched.USD, CNY: fetched.CNY }, timestamp: Date.now(), manualOverride: false }
      setRates(next); setEditUSD(String(fetched.USD)); setEditCNY(String(fetched.CNY)); persistRates(next)
    }).finally(() => setLoading(false))
  }

  function handleReset() {
    setEditUSD(rates.rates.USD.toFixed(2))
    setEditCNY(rates.rates.CNY.toFixed(2))
  }

  function thisMonday(): string {
    const d = new Date(); const day = d.getDay()
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
    return d.toISOString().slice(0, 10)
  }

  function monthRange(offset: number) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + offset)
    const y = d.getFullYear(); const m = d.getMonth() + 1
    return { start: `${y}-${String(m).padStart(2, "0")}-01`, end: `${y}-${String(m).padStart(2, "0")}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}` }
  }

  function daysBack(days: number) {
    const end = dateEndToday ? todayISO() : dateEnd
    if (!end) return
    const d = new Date(end); d.setDate(d.getDate() - days)
    setDateStart(d.toISOString().slice(0, 10))
  }

  const dayCount = (() => {
    if (!dateStart || !dateEnd) return null
    const diff = Math.round((new Date(dateEnd).getTime() - new Date(dateStart).getTime()) / 86400000) + 1
    return diff > 0 ? diff : null
  })()

  const formatTS = (ts: number) => {
    if (!ts) return "从未"
    const d = new Date(ts)
    return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }

  const monthOffsets = [-5, -4, -3, -2, -1, 0]

  return (
    <Stack spacing={2} sx={{ height: "100%", overflow: "auto", p: 1.5 }}>
      {/* ── 默认汇率 ── */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>默认汇率</Typography>
          <Typography variant="caption" color="text.secondary">更新于 {formatTS(rates.timestamp)}</Typography>
        </Box>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <TextField
              label="$ 1 = k"
              type="number"
              value={editUSD}
              onChange={e => setEditUSD(e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label="¥ 1 = k"
              type="number"
              value={editCNY}
              onChange={e => setEditCNY(e.target.value)}
              sx={{ flex: 1 }}
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Button variant="outlined" startIcon={<RestartAltOutlined />} onClick={handleReset}>重置</Button>
            <Button variant="outlined" startIcon={loading ? <CircularProgress size={14} /> : <RefreshOutlined />} onClick={handleRefresh} disabled={loading}>刷新</Button>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSaveRates}>保存</Button>
            </Box>
          </Stack>
        </Stack>
      </Box>

      <Divider />

      {/* ── 起止日期 ── */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>起止日期</Typography>
          {dayCount != null && (
            <Typography variant="caption" color="text.secondary">共 {dayCount} 天</Typography>
          )}
        </Box>
        <Stack spacing={1}>
          <ButtonGroup variant="outlined" size="small" sx={{ flexWrap: "wrap", width: "100%" }}>
            {monthOffsets.map(offset => {
              const d = new Date(); d.setMonth(d.getMonth() + offset)
              return (
                <Button
                  key={offset}
                  size="small"
                  variant="outlined"
                  onClick={() => { const r = monthRange(offset); setDateStart(r.start); if (!dateEndToday) setDateEnd(r.end) }}
                >
                  {d.getMonth() + 1}月
                </Button>
              )
            })}
          </ButtonGroup>

          <TextField
            label="开始"
            sx={{ mt: 0.5 }}
            type="date"
            value={dateStart}
            onChange={e => setDateStart(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <ButtonGroup variant="outlined" size="small" sx={{ flexWrap: "wrap", width: "100%" }}>
            <Button onClick={() => { const y = new Date().getFullYear(); setDateStart(`${y}-01-01`) }}>年初</Button>
            <Button onClick={() => { const d = new Date(); setDateStart(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`) }}>月初</Button>
            <Button onClick={() => setDateStart(thisMonday())}>周一</Button>
          </ButtonGroup>

          <TextField
            label="结束"
            sx={{ mt: 0.5 }}
            type="date"
            value={dateEnd}
            disabled={dateEndToday}
            onChange={e => { setDateEndToday(false); setDateEnd(e.target.value) }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
            <FormControlLabel
              control={<Switch size="small" checked={dateEndToday} onChange={e => setDateEndToday(e.target.checked)} />}
              label="至今"
              sx={{ mr: 0, "& .MuiFormControlLabel-label": { fontSize: 13 } }}
            />
            <ButtonGroup variant="outlined" size="small">
              <Button onClick={() => daysBack(7)}>7天</Button>
              <Button onClick={() => daysBack(30)}>30天</Button>
              <Button onClick={() => daysBack(90)}>90天</Button>
            </ButtonGroup>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}
