import { Component, type ErrorInfo, type ReactNode } from "react"
import { Box, Button, Text } from "./ui"

interface Props {
  children: ReactNode
  /** 出错时展示的模块名，便于定位 */
  label?: string
}

interface State {
  error: Error | null
}

/**
 * 审计 P1-4：全局错误边界。
 * 之前任何渲染期异常（如物料字段为空导致 toLocaleString 崩溃）都会直接白屏且无提示。
 * 包在编辑器内容外层后，单模块崩溃被隔离，并显示可重试的兜底 UI。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 仅记录到控制台；如需上报可在此接入 Sentry 等
    console.error(`[ErrorBoundary${this.props.label ? ` - ${this.props.label}` : ""}]`, error, info)
  }

  private handleReset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5, alignItems: "flex-start" }}>
        <Text style={{ fontWeight: 600, fontSize: 16 }}>模块加载出错</Text>
        <Text style={{ color: "var(--text-dim)" }}>
          {this.props.label ? `${this.props.label} 渲染异常：` : "渲染异常："}{error.message}
        </Text>
        <Button intent="primary" onClick={this.handleReset}>重试</Button>
      </Box>
    )
  }
}
