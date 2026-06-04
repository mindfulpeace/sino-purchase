import { useState, useEffect } from "react"
import { Dialog, Button, InputGroup, NumericInput, Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { usePlan } from "../PlanContext"
import { todayISO } from "../helpers"

const STORAGE_KEY = "sino-exchange-rates"
const FETCH_INTERVAL = 24 * 60 * 60 * 1000

interface StoredRates {
  rates: { ZMW: number; USD: number; CNY: number }
  timestamp: number
  manualOverride: boolean
}

function persistRates(rat: StoredRates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rat))
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function SettingsDialog({ isOpen, onClose }: Props) {
  const { dateStart, dateEnd, dateEndToday, setDateStart, setDateEnd, setDateEndToday, reload } = usePlan()

  const [rates, setRates] = useState<StoredRates>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      if (s) return JSON.parse(s)
    } catch { /* empty */ }
    return { rates: { ZMW: 1, USD: 26, CNY: 3.6 }, timestamp: 0, manualOverride: false }
  })
  const [editUSD, setEditUSD] = useState(String(rates.rates.USD))
  const [editCNY, setEditCNY] = useState(String(rates.rates.CNY))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (rates.manualOverride) return
    if (Date.now() - rates.timestamp < FETCH_INTERVAL) return
    const ctrl = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    fetch("https://open.er-api.com/v6/latest/ZMW", { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => {
        if (data.rates?.USD != null && data.rates?.CNY != null) {
          const newRates: StoredRates = {
            rates: { ZMW: 1, USD: Math.round((1 / data.rates.USD) * 100) / 100, CNY: Math.round((1 / data.rates.CNY) * 100) / 100 },
            timestamp: Date.now(),
            manualOverride: false,
          }
          setRates(newRates)
          setEditUSD(String(newRates.rates.USD))
          setEditCNY(String(newRates.rates.CNY))
          persistRates(newRates)
        }
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [rates.manualOverride, rates.timestamp])

  function handleSaveRates() {
    const usd = Math.round(parseFloat(editUSD) * 100) / 100
    const cny = Math.round(parseFloat(editCNY) * 100) / 100
    if (usd > 0 && cny > 0) {
      const newRates: StoredRates = { rates: { ZMW: 1, USD: usd, CNY: cny }, timestamp: Date.now(), manualOverride: true }
      setRates(newRates)
      persistRates(newRates)
    }
  }

  function handleRefresh() {
    setLoading(true)
    fetch("https://open.er-api.com/v6/latest/ZMW")
      .then(r => r.json())
      .then(data => {
        if (data.rates?.USD != null && data.rates?.CNY != null) {
          const newRates: StoredRates = {
            rates: { ZMW: 1, USD: Math.round((1 / data.rates.USD) * 100) / 100, CNY: Math.round((1 / data.rates.CNY) * 100) / 100 },
            timestamp: Date.now(),
            manualOverride: false,
          }
          setRates(newRates)
          setEditUSD(String(newRates.rates.USD))
          setEditCNY(String(newRates.rates.CNY))
          persistRates(newRates)
        }
      })
      .finally(() => setLoading(false))
  }

  function thisMonday(): string {
    const d = new Date()
    const day = d.getDay()
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
    return d.toISOString().slice(0, 10)
  }

  function monthRange(offset: number) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() + offset)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    return {
      start: `${y}-${String(m).padStart(2, "0")}-01`,
      end: `${y}-${String(m).padStart(2, "0")}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`,
    }
  }

  function daysBack(days: number) {
    const end = dateEndToday ? todayISO() : dateEnd
    if (!end) return
    const d = new Date(end)
    d.setDate(d.getDate() - days)
    setDateStart(d.toISOString().slice(0, 10))
  }

  const formatTS = (ts: number) => {
    if (!ts) return "从未"
    const d = new Date(ts)
    return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }

  const initUSD = rates.rates.USD.toFixed(2)
  const initCNY = rates.rates.CNY.toFixed(2)

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="设置" style={{ width: 420 }}>
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-dim)" }}>汇率</h3>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          <span>$ 1 = k</span>
          <NumericInput value={editUSD} onValueChange={v => setEditUSD(String(v))} style={{ width: 70 }} />
          <span>¥ 1 = k</span>
          <NumericInput value={editCNY} onValueChange={v => setEditCNY(String(v))} style={{ width: 70 }} />
          <Button small minimal onClick={() => { setEditUSD(initUSD); setEditCNY(initCNY) }}>重置</Button>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 12, color: "var(--text-dim)" }}>
          <span>更新于 {formatTS(rates.timestamp)}</span>
          <Button small minimal icon={<Icon icon={IconNames.REFRESH} />} onClick={handleRefresh} disabled={loading}>
            刷新
          </Button>
          <Button small intent="primary" onClick={handleSaveRates}>保存</Button>
        </div>

        <h3 style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 600, color: "var(--text-dim)" }}>
          日期区间 {dateStart && dateEnd ? `(${Math.round((new Date(dateEnd).getTime() - new Date(dateStart).getTime()) / 86400000) + 1})` : ""}
        </h3>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {[-5, -4, -3, -2, -1, 0].map(offset => {
            const d = new Date()
            d.setMonth(d.getMonth() + offset)
            return (
              <Button key={offset} small minimal onClick={() => {
                const r = monthRange(offset)
                setDateStart(r.start)
                if (!dateEndToday) setDateEnd(r.end)
              }}>
                {d.getMonth() + 1}月
              </Button>
            )
          })}
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>开始</span>
          <InputGroup type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} style={{ width: 150 }} />
          <Button small minimal onClick={() => { const y = new Date().getFullYear(); setDateStart(`${y}-01-01`) }}>年初</Button>
          <Button small minimal onClick={() => { const d = new Date(); setDateStart(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`) }}>月初</Button>
          <Button small minimal onClick={() => setDateStart(thisMonday())}>周一</Button>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>结束</span>
          <InputGroup type="date" value={dateEnd} disabled={dateEndToday} onChange={e => { setDateEndToday(false); setDateEnd(e.target.value) }} style={{ width: 150 }} />
          <Button small minimal active={dateEndToday} onClick={() => setDateEndToday(!dateEndToday)}>至今</Button>
          <Button small minimal onClick={() => daysBack(7)}>7天</Button>
          <Button small minimal onClick={() => daysBack(30)}>30天</Button>
          <Button small minimal onClick={() => daysBack(90)}>90天</Button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 8 }}>
          <Button onClick={() => { reload(); onClose() }}>刷新 & 关闭</Button>
          <Button intent="primary" onClick={onClose}>关闭</Button>
        </div>
      </div>
    </Dialog>
  )
}
