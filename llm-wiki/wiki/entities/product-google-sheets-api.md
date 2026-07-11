# Google Sheets API v4

> **类型**: entity
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/compiled-libs-reference]]
> **版本**: 直连 v4（无官方 SDK，用 fetch）
> ⚠️ 标注：本项目自研封装，含专家编译

## 摘要
本项目把 Google Sheets 当作"云端数据库"使用：OAuth(GSI) 登录后，用 `fetch` 直连 Sheets API v4 读写数据，逻辑层在 `packages/sheets-core`，React 绑定在 `packages/sheets-react`。支持离线编辑 + 同步队列最终一致。

## 详情

### 认证（关键安全约束）
- 令牌仅存内存（`accessToken`/`expiresAt`），**不落盘**；刷新后由 GSI 静默重认证
- `index.html` 加严格 CSP：`script-src` self+accounts.google.com；`connect-src` 仅 Google API；`frame-src` 仅 Google Sheets/账户
- 凭据经 `import.meta.env.VITE_CLIENT_ID` / `VITE_SPREADSHEET_ID` 注入，缺失降级演示模式

### 核心 API
| 能力 | 端点 |
|------|------|
| 读表 | `GET sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}` |
| 追加行 | `POST .../values/{range}:append` |
| 更新单元 | `PUT .../values/{range}` |
| 建表 | `POST sheets.googleapis.com/v4/spreadsheets` |

### 数据一致性设计
- `loadTable` 缓存 `rowMap`（id→行号）；update/remove 直接用行号写，避免每次全列 `findRow`
- 同步队列 `isRetryableStatus()`：网络/超时/429/5xx 重试；401/4xx 判永久失败移出队列
- `fetchWithAuth` 加 15s `AbortController` 超时
- 详见 [[concepts/concept-offline-sync-conflict]]

### 本项目结构
- `packages/sheets-core`：auth / db / sync-queue / config / types（无 React）
- `packages/sheets-react`：SheetsProvider / useAuth / useSheetData / useSync

## 关联
- 相关实体: [[entities/product-react]]
- 参见: [[concepts/concept-offline-sync-conflict]], [[topics/topic-pitfalls-guide]]

## 引用来源
- [1] [[raw/compiled-libs-reference]] — 专家编译
- [2] [[raw/project-experience]] — P0/P1 安全与一致性修复
- [3] https://developers.google.com/sheets/api

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/compiled-libs-reference]] + [[raw/project-experience]]
