// 测试隔离：每个测试文件加载前清空 localStorage。
// 避免跨文件污染——usePlanStore 在模块加载时读取 sino-plan-filter、
// docSettingsStore(persist) 读取 sino-doc-settings 等持久化状态，
// 上一文件写入的日期区间/开关会污染下一文件的 store 初始化，导致组跑偶发失败。
import { beforeEach } from "vitest"

beforeEach(() => {
  try { localStorage.clear() } catch { /* jsdom 无 localStorage 时忽略 */ }
})
