import { useState } from "react"
import { Button, Card, H3, InputGroup, HTMLTable, Tag } from "@blueprintjs/core"
import { useMaterialStore } from "../app/stores/materialStore"

export default function MaterialInfo() {
  const { materials, deleteMaterial } = useMaterialStore()
  const [search, setSearch] = useState("")

  const filtered = materials.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.code.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <H3>物料信息</H3>
        <div style={{ display: "flex", gap: 12 }}>
          <InputGroup
            placeholder="搜索物料..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Button intent="primary" icon="plus">
            新增物料
          </Button>
        </div>
      </div>

      <Card>
        <HTMLTable compact striped style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>物料编码</th>
              <th>物料名称</th>
              <th>分类</th>
              <th>单位</th>
              <th>单价</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td>{m.code}</td>
                <td>{m.name}</td>
                <td>{m.category}</td>
                <td>{m.unit}</td>
                <td>{m.price.toLocaleString()}</td>
                <td>
                  <Button small minimal icon="edit" />
                  <Button small minimal icon="trash" intent="danger" style={{ marginLeft: 8 }} onClick={() => deleteMaterial(m.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>

      <div style={{ marginTop: 24, color: "var(--text-dim)", fontSize: 14 }}>
        <p>💡 数据已持久化到 localStorage</p>
      </div>
    </div>
  )
}
