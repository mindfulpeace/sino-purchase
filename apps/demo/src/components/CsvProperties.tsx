import { useCsv } from "../context/CsvContext"

const typeOptions: Array<{ value: string; label: string }> = [
  { value: "string", label: "string" },
  { value: "number", label: "number" },
  { value: "date", label: "date" },
]

const alignOptions: Array<{ value: string; label: string }> = [
  { value: "left", label: "左" },
  { value: "center", label: "中" },
  { value: "right", label: "右" },
]

export default function CsvProperties() {
  const {
    columns,
    rows,
    selectedColumn,
    selectColumn,
    columnTypes,
    setColumnType,
    columnAlignment,
    setColumnAlignment,
    rowSeparator,
    setRowSeparator,
    headerRow,
    setHeaderRow,
  } = useCsv()

  const colType = selectedColumn !== null ? columnTypes[selectedColumn] ?? "string" : "string"
  const colAlign = selectedColumn !== null ? columnAlignment[selectedColumn] ?? "left" : "left"

  return (
    <div style={{ padding: "12px 16px", fontSize: 13, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* CSV info */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-bright)", marginBottom: 8 }}>
          CSV 信息
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, color: "var(--text-dim)", fontSize: 12 }}>
          <div>行: {rows}</div>
          <div>列: {columns.length}</div>
          <div>总量: {rows * columns.length} 单元格</div>
        </div>
      </div>

      {/* CSV settings */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-bright)", marginBottom: 8 }}>
          解析设置
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={headerRow}
              onChange={(e) => setHeaderRow(e.target.checked)}
              style={{ accentColor: "var(--activitybar-active-border)" }}
            />
            <span style={{ fontSize: 12, color: "var(--text)" }}>首行为表头</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap" }}>分隔符</span>
            <input
              value={rowSeparator}
              onChange={(e) => setRowSeparator(e.target.value)}
              maxLength={2}
              style={{
                width: 40,
                padding: "2px 6px",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                borderRadius: 3,
                color: "var(--text-bright)",
                fontSize: 12,
                textAlign: "center",
                fontFamily: "monospace",
              }}
            />
          </div>
        </div>
      </div>

      {/* Column list */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-bright)", marginBottom: 8 }}>
          列属性
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {columns.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--text-dim)", fontStyle: "italic" }}>
              暂无数据
            </div>
          )}
          {columns.map((col, i) => {
            const isSelected = selectedColumn === i
            return (
              <div
                key={i}
                onClick={() => selectColumn(isSelected ? null : i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: 3,
                  cursor: "pointer",
                  background: isSelected ? "var(--bg-overlay)" : "transparent",
                  color: isSelected ? "var(--text-bright)" : "var(--text-dim)",
                  fontSize: 12,
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--bg-hover)" }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent" }}
              >
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  fontSize: 9,
                  fontWeight: 600,
                  background: isSelected ? "var(--activitybar-active-border)" : "var(--bg-raised)",
                  color: isSelected ? "#fff" : "var(--text-dim)",
                  flexShrink: 0,
                }}>
                  {i}
                </span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  {col}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected column settings */}
      {selectedColumn !== null && columns[selectedColumn] && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-bright)", marginBottom: 8 }}>
            {columns[selectedColumn]} — 设置
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>类型</div>
              <div style={{ display: "flex", gap: 4 }}>
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setColumnType(selectedColumn, opt.value as "string" | "number" | "date")}
                    style={{
                      flex: 1,
                      padding: "3px 0",
                      border: `1px solid ${colType === opt.value ? "var(--activitybar-active-border)" : "var(--border)"}`,
                      borderRadius: 3,
                      background: colType === opt.value ? "var(--bg-overlay)" : "transparent",
                      color: colType === opt.value ? "var(--text-bright)" : "var(--text-dim)",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>对齐</div>
              <div style={{ display: "flex", gap: 4 }}>
                {alignOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setColumnAlignment(selectedColumn, opt.value as "left" | "center" | "right")}
                    style={{
                      flex: 1,
                      padding: "3px 0",
                      border: `1px solid ${colAlign === opt.value ? "var(--activitybar-active-border)" : "var(--border)"}`,
                      borderRadius: 3,
                      background: colAlign === opt.value ? "var(--bg-overlay)" : "transparent",
                      color: colAlign === opt.value ? "var(--text-bright)" : "var(--text-dim)",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
