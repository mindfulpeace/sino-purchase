import { useState } from "react"
import { Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons"
import { DockLayout, useDock } from "@sino-purchase/layout-dock"

/* ── Navigation panels ── */

function BusinessANav() {
  const { openEditor } = useDock()
  return (
    <div className="dv-panel">
      <div className="dv-panel-item" onClick={() => openEditor("business-a")}>
        <Icon icon={IconNames.DOCUMENT} size={14} />
        <span>业务A-详情</span>
      </div>
      <div className="dv-panel-item" onClick={() => openEditor("business-a-list")}>
        <Icon icon={IconNames.LIST} size={14} />
        <span>业务A-列表</span>
      </div>
    </div>
  )
}

function BusinessBNav() {
  const { openEditor } = useDock()
  return (
    <div className="dv-panel">
      <div className="dv-panel-item" onClick={() => openEditor("business-b")}>
        <Icon icon={IconNames.CHART} size={14} />
        <span>业务B-仪表盘</span>
      </div>
      <div className="dv-panel-item" onClick={() => openEditor("business-b-config")}>
        <Icon icon={IconNames.COG} size={14} />
        <span>业务B-配置</span>
      </div>
    </div>
  )
}

/* ── Editor content ── */

function BusinessADetail() {
  return (
    <div className="dv-panel-wide">
      <h3>业务A — 详情页</h3>
      <p>这是业务A的详情面板。右侧应显示"信息面板"和"操作面板"两个标签。</p>
      <div className="dv-panel-input" style={{ marginTop: 12 }}>
        <input className="dv-panel-input" placeholder="搜索内容..." />
      </div>
    </div>
  )
}

function BusinessAList() {
  return (
    <div className="dv-panel-wide">
      <h3>业务A — 列表页</h3>
      <p>这是业务A的列表视图。右侧应显示"筛选面板"。</p>
      <div className="dv-panel-item"><Icon icon={IconNames.DOCUMENT} size={14} /><span>项目 1</span></div>
      <div className="dv-panel-item"><Icon icon={IconNames.DOCUMENT} size={14} /><span>项目 2</span></div>
      <div className="dv-panel-item"><Icon icon={IconNames.DOCUMENT} size={14} /><span>项目 3</span></div>
    </div>
  )
}

function BusinessBDashboard() {
  const [count, setCount] = useState(0)
  return (
    <div className="dv-panel-wide">
      <h3>业务B — 仪表盘</h3>
      <p>这是业务B的仪表盘。右侧应显示"统计面板"。</p>
      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <span>计数器: {count}</span>
        <button onClick={() => setCount(c => c + 1)} style={{ padding: "4px 12px", cursor: "pointer" }}>+1</button>
      </div>
    </div>
  )
}

function BusinessBConfig() {
  return (
    <div className="dv-panel-wide">
      <h3>业务B — 配置</h3>
      <p>这是业务B的配置页面。右侧应显示"配置选项"和"日志面板"两个标签。</p>
      <div style={{ marginTop: 12 }}>
        <label><input type="checkbox" defaultChecked /> 启用功能X</label><br />
        <label><input type="checkbox" /> 启用功能Y</label><br />
        <label><input type="checkbox" defaultChecked /> 启用功能Z</label>
      </div>
    </div>
  )
}

/* ── Right panels (per business) ── */

function InfoPanel() {
  return (
    <div className="dv-panel">
      <h4>信息面板</h4>
      <p style={{ fontSize: 12, opacity: 0.8 }}>
        当前编辑的业务A详情。这里可以显示相关元数据、关联信息等。
      </p>
      <div className="dv-panel-item">
        <Icon icon={IconNames.INFO_SIGN} size={12} />
        <span>状态: 进行中</span>
      </div>
      <div className="dv-panel-item">
        <Icon icon={IconNames.PERSON} size={12} />
        <span>负责人: 张三</span>
      </div>
    </div>
  )
}

function ActionPanel() {
  return (
    <div className="dv-panel">
      <h4>操作面板</h4>
      <div className="dv-panel-item" style={{ color: "#15B371" }}>
        <Icon icon={IconNames.TICK} size={14} />
        <span>审批通过</span>
      </div>
      <div className="dv-panel-item" style={{ color: "#F55656" }}>
        <Icon icon={IconNames.CROSS} size={14} />
        <span>驳回</span>
      </div>
      <div className="dv-panel-item">
        <Icon icon={IconNames.COMMENT} size={14} />
        <span>添加评论</span>
      </div>
    </div>
  )
}

function FilterPanel() {
  return (
    <div className="dv-panel">
      <h4>筛选面板</h4>
      <input className="dv-panel-input" placeholder="关键词过滤..." />
      <div style={{ marginTop: 8 }}>
        <label><input type="checkbox" defaultChecked /> 已完成</label><br />
        <label><input type="checkbox" defaultChecked /> 进行中</label><br />
        <label><input type="checkbox" /> 已取消</label>
      </div>
    </div>
  )
}

function StatsPanel() {
  return (
    <div className="dv-panel">
      <h4>统计面板</h4>
      <div className="dv-panel-item">
        <Icon icon={IconNames.NUMERICAL} size={14} />
        <span>总计: 1,234</span>
      </div>
      <div className="dv-panel-item">
        <Icon icon={IconNames.TRENDING_UP} size={14} />
        <span>增长: +12%</span>
      </div>
      <div className="dv-panel-item">
        <Icon icon={IconNames.TIME} size={14} />
        <span>更新时间: 10分钟前</span>
      </div>
    </div>
  )
}

function ConfigOptionsPanel() {
  return (
    <div className="dv-panel">
      <h4>配置选项</h4>
      <div className="dv-panel-item">
        <Icon icon={IconNames.SETTINGS} size={14} />
        <span>全局参数</span>
      </div>
      <div className="dv-panel-item">
        <Icon icon={IconNames.KEY} size={14} />
        <span>API 密钥</span>
      </div>
      <div className="dv-panel-item">
        <Icon icon={IconNames.NOTIFICATIONS} size={14} />
        <span>通知设置</span>
      </div>
    </div>
  )
}

function LogPanel() {
  return (
    <div className="dv-panel">
      <h4>日志面板</h4>
      <div style={{ fontSize: 11, opacity: 0.7, fontFamily: "monospace" }}>
        <div>[10:30] 配置更新成功</div>
        <div>[10:28] 参数校验通过</div>
        <div>[10:25] 加载配置模板</div>
        <div>[10:20] 启动服务</div>
      </div>
    </div>
  )
}

/* ── App ── */

export function App() {
  return (
    <DockLayout
      defaultTheme="dark"
      navigation={[
        {
          id: "business-a",
          icon: <Icon icon={IconNames.FOLDER_OPEN} size={20} />,
          label: "业务模块A",
          content: <BusinessANav />,
        },
        {
          id: "business-b",
          icon: <Icon icon={IconNames.GLOBE} size={20} />,
          label: "业务模块B",
          content: <BusinessBNav />,
        },
      ]}
      editors={[
        {
          id: "business-a",
          label: "业务A-详情",
          content: <BusinessADetail />,
          rightPanels: [
            { id: "info", label: "信息面板", content: <InfoPanel /> },
            { id: "actions", label: "操作面板", content: <ActionPanel /> },
          ],
        },
        {
          id: "business-a-list",
          label: "业务A-列表",
          content: <BusinessAList />,
          rightPanels: [
            { id: "filter", label: "筛选面板", content: <FilterPanel /> },
          ],
        },
        {
          id: "business-b",
          label: "业务B-仪表盘",
          content: <BusinessBDashboard />,
          rightPanels: [
            { id: "stats", label: "统计面板", content: <StatsPanel /> },
          ],
        },
        {
          id: "business-b-config",
          label: "业务B-配置",
          content: <BusinessBConfig />,
          rightPanels: [
            { id: "config", label: "配置选项", content: <ConfigOptionsPanel /> },
            { id: "logs", label: "日志面板", content: <LogPanel /> },
          ],
        },
      ]}
      right={{ size: 250, minSize: 180 }}
      left={{ size: 220, minSize: 150 }}
    />
  )
}
