import { useState } from "react"
import { Button, Card, H3, InputGroup, HTMLTable } from "@blueprintjs/core"

interface Material {
  id: string
  name: string
  code: string
  unit: string
  price: number
  category: string
}

const sampleMaterials: Material[] = [
  { id: "1", name: "钢材", code: "MAT-001", unit: "吨", price: 5500, category: "原材料" },
  { id: "2", name: "铝材", code: "MAT-002", unit: "吨", price: 18000, category: "原材料" },
  { id: "3", name: "螺丝 M8", code: "MAT-003", unit: "个", price: 0.15, category: "标准件" },
]

export default function MaterialInfo() {
  const [materials, setMaterials] = useState<Material[]>(sampleMaterials)
  const [search, setSearch] = useState("")

  const filtered = materials.filter(m => 
    m.name.includes(search) || m.code.includes(search)
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
                  <Button small minimal icon="edit">编辑</Button>
                  <Button small minimal icon="trash" style={{ marginLeft: 8 }}>删除</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>

      <div style={{ marginTop: 24, color: "var(--text-dim)", fontSize: 14 }}>
        <p>💡 提示：此页面当前为演示数据，未来将接入 Google Sheets 同步。</p>
      </div>
    </div>
  )
}
