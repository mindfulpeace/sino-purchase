import { useState, useRef } from "react"
import { SheetsProvider, useAuth, useSheetData, useSync } from "@sino-purchase/sheets-react"

const CLIENT_ID = "640615713474-kh9jd1nfaajmdvj7576edfb9a88dn2b3.apps.googleusercontent.com"
const SPREADSHEET_ID = "1JYxdYOmIDu0EEDA8SJ-VHFhw578Fm8aXuMcuWwLGLJg"

interface Item {
  [key: string]: unknown
  id: string
  name: string
  quantity: number
  unit: string
  note: string
  createdAt: number
  updatedAt: number
}

const HEADERS: string[] = ["id", "name", "quantity", "unit", "note", "createdAt", "updatedAt"]

const NUMERIC = new Set<keyof Item>(["quantity", "createdAt", "updatedAt"])

function LoginGate({ children }: { children: React.ReactNode }) {
  const { ready, loggedIn, login } = useAuth()

  if (!ready) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 18 }}>加载 Google 认证...</div>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Sheets API Demo</h1>
        <p style={{ margin: 0, color: "#888", fontSize: 14 }}>测试 @sino-purchase/sheets-react 全部 CRUD 功能</p>
        <button onClick={login} style={{ padding: "10px 32px", fontSize: 16, cursor: "pointer", borderRadius: 6, border: "1px solid #555", background: "#2a2a4e", color: "#e0e0e0" }}>
          登录 Google
        </button>
      </div>
    )
  }

  return <>{children}</>
}

function SyncBadge() {
  const { status, retry } = useSync()
  const color = status === "synced" ? "#4caf50" : status === "syncing" ? "#ff9800" : "#f44336"
  const label = status === "synced" ? "已同步" : status === "syncing" ? "同步中" : "未同步"
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
      {status === "unsynced" && (
        <button onClick={retry} style={{ fontSize: 11, cursor: "pointer", background: "none", border: "1px solid #555", borderRadius: 3, color: "#ccc" }}>
          重试
        </button>
      )}
    </span>
  )
}

function DemoApp() {
  const { data, loading, reload, add, update, remove } = useSheetData<Item>({
    sheetName: "demo",
    headers: HEADERS,
    numericFields: NUMERIC,
  })

  const [newName, setNewName] = useState("")
  const [newQty, setNewQty] = useState("1")
  const [newUnit, setNewUnit] = useState("个")
  const [newNote, setNewNote] = useState("")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editQty, setEditQty] = useState("")
  const [editUnit, setEditUnit] = useState("")
  const [editNote, setEditNote] = useState("")

  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const msgTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function flash(msg: string, err?: string) {
    setMsg(msg)
    if (err) setError(err)
    if (msgTimer.current) clearTimeout(msgTimer.current)
    msgTimer.current = setTimeout(() => { setMsg(""); setError("") }, 3000)
  }

  function handleAdd() {
    if (!newName.trim()) return
    add({ name: newName.trim(), quantity: Number(newQty) || 1, unit: newUnit || "个", note: newNote.trim() })
    setNewName("")
    setNewQty("1")
    setNewUnit("个")
    setNewNote("")
    flash("添加成功（已写入本地，后台同步中）")
  }

  function handleEdit(item: Item) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditQty(String(item.quantity))
    setEditUnit(item.unit)
    setEditNote(item.note || "")
  }

  function handleSave(id: string) {
    update(id, { name: editName, quantity: Number(editQty) || 1, unit: editUnit, note: editNote })
    setEditingId(null)
    flash("更新成功（已写入本地，后台同步中）")
  }

  function handleDelete(id: string) {
    remove(id)
    flash("删除成功（已写入本地，后台同步中）")
  }

  function handleCancelEdit() {
    setEditingId(null)
  }

  const fields = data.length > 0
    ? Object.keys(data[0]).filter(k => k !== "id" && k !== "createdAt" && k !== "updatedAt")
    : ["name", "quantity", "unit", "note"]

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Sheets API Demo</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
            SPREADSHEET_ID: {SPREADSHEET_ID.slice(0, 12)}... | sheet: "demo"
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <SyncBadge />
          <button onClick={reload} style={{ padding: "6px 16px", cursor: "pointer", borderRadius: 4, border: "1px solid #555", background: "#2a2a4e", color: "#e0e0e0", fontSize: 13 }}>
            重新加载
          </button>
          <span style={{ fontSize: 13, color: "#888" }}>行数: {data.length}</span>
        </div>
      </div>

      {msg && <div style={{ padding: "8px 16px", background: error ? "#3e2020" : "#1e3e20", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{msg}</div>}

      {error && <div style={{ padding: "8px 16px", background: "#3e2020", borderRadius: 6, marginBottom: 16, fontSize: 13, color: "#ff8a80" }}>{error}</div>}

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {/* 添加表单 */}
        <div style={{ flex: "0 0 280px" }}>
          <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>添加行 (C)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input placeholder="名称 *" value={newName} onChange={e => setNewName(e.target.value)}
              style={inputStyle} />
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="数量" type="number" value={newQty} onChange={e => setNewQty(e.target.value)}
                style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="单位" value={newUnit} onChange={e => setNewUnit(e.target.value)}
                style={{ ...inputStyle, width: 70 }} />
            </div>
            <input placeholder="备注" value={newNote} onChange={e => setNewNote(e.target.value)}
              style={inputStyle} />
            <button onClick={handleAdd} style={{ ...btnStyle, background: "#1b5e20" }}>
              添加
            </button>
          </div>
        </div>

        {/* 数据表格 */}
        <div style={{ flex: 1, minWidth: 400 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>数据表 (R / U / D)</h2>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "#888" }}>加载中...</div>
          ) : data.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#888" }}>
              暂无数据，请先在左侧添加行，或检查 sheet 是否存在
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #444" }}>
                    <th style={thStyle}>#</th>
                    {fields.map(f => <th key={f} style={thStyle}>{f}</th>)}
                    <th style={{ ...thStyle, width: 140 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, i) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #333" }}>
                      <td style={tdStyle}>{i + 1}</td>
                      {editingId === item.id ? (
                        <>
                          <td style={tdStyle}><input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} /></td>
                          <td style={tdStyle}><input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} style={{ ...inputStyle, width: 70 }} /></td>
                          <td style={tdStyle}><input value={editUnit} onChange={e => setEditUnit(e.target.value)} style={{ ...inputStyle, width: 60 }} /></td>
                          <td style={tdStyle}><input value={editNote} onChange={e => setEditNote(e.target.value)} style={inputStyle} /></td>
                          <td style={tdStyle}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => handleSave(item.id)} style={{ ...btnStyle, background: "#1565c0", fontSize: 12, padding: "3px 10px" }}>保存</button>
                              <button onClick={handleCancelEdit} style={{ ...btnStyle, background: "#555", fontSize: 12, padding: "3px 10px" }}>取消</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={tdStyle}>{item.name}</td>
                          <td style={tdStyle}>{item.quantity}</td>
                          <td style={tdStyle}>{item.unit}</td>
                          <td style={{ ...tdStyle, color: item.note ? "#ccc" : "#555" }}>{item.note || "-"}</td>
                          <td style={{ ...tdStyle, display: "flex", gap: 6 }}>
                            <button onClick={() => handleEdit(item)} style={{ ...btnStyle, background: "#1565c0", fontSize: 12, padding: "3px 10px" }}>编辑</button>
                            <button onClick={() => handleDelete(item.id)} style={{ ...btnStyle, background: "#b71c1c", fontSize: 12, padding: "3px 10px" }}>删除</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
              cell 内 id / createdAt / updatedAt 为自动字段，仅显示可编辑列
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 4,
  border: "1px solid #444",
  background: "#222",
  color: "#e0e0e0",
  fontSize: 13,
  outline: "none",
  width: "100%",
}

const btnStyle: React.CSSProperties = {
  padding: "6px 16px",
  cursor: "pointer",
  borderRadius: 4,
  border: "none",
  color: "#fff",
  fontSize: 13,
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  color: "#888",
  fontSize: 12,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
}

const tdStyle: React.CSSProperties = {
  padding: "6px 10px",
  verticalAlign: "middle",
}

function App() {
  return (
    <SheetsProvider clientId={CLIENT_ID} spreadsheetId={SPREADSHEET_ID}>
      <LoginGate>
        <DemoApp />
      </LoginGate>
    </SheetsProvider>
  )
}

export default App
