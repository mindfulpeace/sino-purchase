# 离线优先与同步冲突解决（行业规范）

> **类型**: concept
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/project-experience]] + 专家编译
> **可信度**: ✅ 本项目实现来自 P0/P1 修复；🟡 策略对比为专家综合

## 摘要
把云端表（Google Sheets）当数据库用时，必须处理"离线编辑→重连同步→冲突"问题。本项目用"内存令牌 + 同步队列 + 行号回写 + 按错误类型分流"实现最终一致。

## 详情

### 冲突解决策略对比（行业）
| 策略 | 机制 | 适用 |
|------|------|------|
| Last-Write-Wins | 以时间戳/版本最新为准 | 单用户/低并发（本项目场景）✅ |
| 版本向量 | 跟踪各副本版本，检测真冲突 | 多端协同 |
| CRDT | 无冲突数据结构，自动合并 | 协同编辑 |
| OT | 操作变换，服务端串行化 | 协同编辑 |

> 本项目为单主账号 + 偶发离线，采用 **Last-Write-Wins + 同步队列** 足够。

### 本项目实现（来自 P0/P1 修复）
1. **令牌不落盘**：`accessToken`/`expiresAt` 仅内存；刷新后 GSI 静默重认证（安全 + 避免刷新即掉登录）
2. **行号回写**：`loadTable` 缓存 `rowMap`(id→行号)；update/remove 直接用行号，不再每次 `findRow` 全列扫描（修复云端数据漂移）
3. **同步队列分流**：`isRetryableStatus()` ——
   - 重试：网络中断/超时、429、5xx
   - 永久失败（移出队列）：401（无 refresh 只能重登）、4xx 业务错误
   - 避免无限重排到 1000 条上限
4. **超时保护**：`fetchWithAuth` 加 15s `AbortController`
5. **失败可见**：`SYNC_ERROR_EVENT` 广播，`useSync.failedCount` 供 UI 提示
6. **写缓存**：`headerCache`/`sheetIdCache`(60s TTL)，`insertRow` 返回新行号维护 rowMap

### 待演进（P2）
- OAuth scope 收窄 + 后端代理持令牌（根治令牌仅内存的局限）
- 多 tab 通过 `BroadcastChannel` 同步，避免同浏览器多标签冲突

## 关联
- 相关实体: [[entities/product-google-sheets-api]]
- 相关概念: [[concepts/concept-erp-module-architecture]]
- 参见: [[topics/topic-pitfalls-guide]]

## 引用来源
- [1] [[raw/project-experience]] — P0/P1 审计修复记录
- [2] https://developers.google.com/sheets/api

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/project-experience]] + 专家编译
