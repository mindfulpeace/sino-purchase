# Emotion 11

> **类型**: entity
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/compiled-libs-reference]]
> **版本**: @emotion/react = 11.14.0 / @emotion/styled = 11.14.1
> ⚠️ 标注：专家编译，建议核对官方文档

## 摘要
Emotion 是 CSS-in-JS 库，是 MUI v9 的样式引擎依赖。业务代码通常直接用 MUI 的 `sx` 即可；高级场景可用 `@emotion/styled` 或 `css` prop，主题经 MUI ThemeProvider 注入。

## 详情

### 关系
- MUI v9 底层使用 Emotion 渲染样式，因此二者版本需匹配（已锁定 11.14）
- 主题通过 MUI `ThemeProvider` 注入，`useTheme()` 取色；Emotion 自身不需要单独配置

### 高级用法
```tsx
import styled from '@emotion/styled'
const Box = styled.div` background: ${(p) => p.theme.palette.background.paper}; `
```
```tsx
import { css } from '@emotion/react'
<div css={css` color: red; `} />
```

### 本项目约定
- 通用组件默认样式下沉到 MUI 主题的 `components` 与 `MuiCssBaseline.styleOverrides`
- 组件内用 `sx` 引用 `theme.palette.task.*` 语义色（见 [[topics/topic-design-system]]）

## 关联
- 相关实体: [[entities/product-mui]], [[entities/product-react]]
- 参见: [[topics/topic-design-system]]

## 引用来源
- [1] [[raw/compiled-libs-reference]] — 专家编译
- [2] https://emotion.sh/docs

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/compiled-libs-reference]]
