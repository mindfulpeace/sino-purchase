# 优化计划：让项目完全可控

## 执行顺序
1. P0 — 修复现有问题
2. P1 — 新增测试基础设施 + 编写测试
3. P2 — CI 流水线
4. P3 — 可选优化

---

## P0: 修复现有问题

### P0-1: 修复 3 个 eslint 错误
**文件**: `apps/demo/src/components/FileTree.tsx:42` — 在 `export const projectTreeData` 前加 `// eslint-disable-next-line react-refresh/only-export-components`
**文件**: `apps/demo/src/context/CsvContext.tsx:63` — 在 `export function useCsv()` 前加 `// eslint-disable-next-line react-refresh/only-export-components`
**文件**: `packages/ui/src/theme/ThemeContext.tsx:28` — 在 `export function useTheme()` 前加 `// eslint-disable-next-line react-refresh/only-export-components`

### P0-2: 修复 CSS import TS 报错
**文件**: `packages/ui/src/vite-env.d.ts` (新建) — 内容: `/// <reference types="vite/client" />`

### P0-3: demo tsconfig 加 strict: true
**文件**: `apps/demo/tsconfig.json` — 在 `"erasableSyntaxOnly"` 后加 `"strict": true`

### P0-4: 删除陈旧的根 dist/
**命令**: `rm -rf dist/`

### P0-5: 添加 favicon link
**文件**: `apps/demo/index.html` — 在 `<title>` 前加 `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`

### P0-6: 修复 Monaco 版本号
**文件**: `apps/demo/src/pages/MonacoShowcase.tsx:69` — `"@blueprintjs/icons": "^6.0.0"` → `"^6.10.0"`

---

## P1: 测试

### 新增 devDependencies (根 package.json)
`@testing-library/jest-dom`, `@testing-library/react`, `jsdom`, `vitest`

### 新增文件
- `packages/ui/vite.config.ts` — test 配置 (jsdom, globals, setupFiles)
- `packages/ui/src/test-setup.ts` — `import "@testing-library/jest-dom/vitest"`
- `packages/ui/src/theme/ThemeContext.test.tsx`
- `packages/ui/src/hooks/useTabs.test.ts`
- `packages/ui/src/hooks/useSidebarResize.test.ts`

### root scripts 新增
`test`, `test:watch`, `typecheck`

---

## P2: CI
`.github/workflows/ci.yml` — lint → typecheck → test → build

---

## P3: 可选
- `packages/ui/package.json` 加 license/repository/author
- `apps/demo/vite.config.ts` 删除 `include: ["papaparse"]`

---

## 验证
1. `npm run lint` — 0 errors
2. `npm run typecheck` — tsc 通过
3. `npm run test` — 测试通过
4. `npm run build` — 构建成功
