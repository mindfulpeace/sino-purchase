# PapaParse 5

> **类型**: entity
> **创建时间**: 2026-07-08
> **最后更新**: 2026-07-08
> **来源**: [[raw/compiled-libs-reference]]
> **版本**: papaparse = 5.5.3
> ⚠️ 标注：专家编译，建议核对官方文档

## 摘要
PapaParse 是强大的 CSV 解析库，本项目用于采购/记账数据的导入（如 CashGrid 的 ImportDialog），支持流式逐行处理大文件。

## 详情

### 解析
```ts
import Papa from 'papaparse'
Papa.parse(csvString, {
  header: true,            // 首行为字段名 → 返回对象数组
  skipEmptyLines: true,
  dynamicTyping: true,     // 自动转数字/布尔
  complete: (res) => { /* res.data, res.errors */ },
  error: (err) => {...},
})
// 解析 File 对象同样支持（自动识别）
```

### 导出
```ts
const csv = Papa.unparse(rows, { columns: [...] })
```

### 大文件
- 用 `step: (results) => {...}` 回调逐行处理，避免一次性载入内存峰值
- `chunk` 模式适合超大文件

## 关联
- 相关实体: [[entities/product-react]]
- 参见: [[topics/topic-pitfalls-guide]]

## 引用来源
- [1] [[raw/compiled-libs-reference]] — 专家编译
- [2] https://www.papaparse.com/docs

## 变更记录
- 2026-07-08: 初始创建，来源 [[raw/compiled-libs-reference]]
