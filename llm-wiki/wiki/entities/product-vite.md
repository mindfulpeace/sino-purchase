# Vite 8

> **类型**: entity
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/compiled-libs-reference]]
> **版本**: vite = 8.0.16
> ⚠️ 标注：v8 较新，以下为专家编译，版本敏感细节建议核对官方迁移指南

## 摘要
Vite 是新一代前端构建工具（基于 esbuild + Rollup），本项目作为 monorepo 的构建与 dev server 入口（主应用端口 5173，自动 fallback）。

## 详情

### 常用命令（本项目 package.json）
| 命令 | 说明 |
|------|------|
| `npm run dev` | 主应用 dev server（5173） |
| `npm run build` | 构建全部子包 → 主应用（含 `tsc -b` 类型检查） |
| `npm run typecheck` | `tsc -b` 全项目类型检查 |
| `npm run test` | vitest 全部测试 |
| `npm run lint` | ESLint |

### 关键配置约定
- `base: '/'` —— 适配 Cloudflare Pages 部署
- 5 个页面用 `React.lazy` 分包，首屏不加载 Monaco(~600KB)/xlsx(~416KB)
- monorepo 用 npm workspaces（排除 desk-ui/ui-dock/demo-ui 等废弃包）

### 迁移注意
- v8 较新，插件生态需确认 peer 兼容
- 建议核对官方 `https://vite.dev/guide/migration` 确认破坏性变更

## 关联
- 相关实体: [[entities/product-react]]
- 参见: [[topics/topic-project-architecture]]

## 引用来源
- [1] [[raw/compiled-libs-reference]] — 专家编译（待核验）
- [2] https://vite.dev/

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/compiled-libs-reference]]
