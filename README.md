# Sino Purchase V2

采购管理系统前端应用。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 部署到 FTP

```bash
# 先创建 .env 文件（复制 .env.example 并填写）
npm run deploy
```

## 📦 项目结构

```
sino-purchase-v2/
├── packages/          # 共享库
│   ├── desk-ui/       # UI 组件库
│   ├── sheets-api/    # Google Sheets API
│   ├── utils/         # 工具函数
│   ├── doc/           # 文档组件
│   └── print/         # 打印组件
├── apps/              # 应用
│   ├── sino-purchase-v2/  # 主应用
│   ├── demo-ui/          # UI 库演示
│   └── sheets-api-demo/   # API 演示
└── scripts/           # 部署脚本
```

## 🛠️ 技术栈

- React 19 + Vite 8 + TypeScript 6
- Blueprint 6 UI 框架
- Google Sheets API v4

## 📄 部署说明

### 1. 配置环境变量

复制 `apps/sino-purchase-v2/.env.example` 为 `apps/sino-purchase-v2/.env`，并填写：

```env
FTP_USER=your-ftp-user
FTP_PASS=your-ftp-password
FTP_HOST=ftp.yourdomain.com
REMOTE_DIR=/v2/desk
```

### 2. 执行部署

```bash
npm run build
npm run deploy
```

## 🌐 访问地址

部署后访问：`https://yourdomain.com/v2/desk/`

## 📝 开发指南

### 添加新功能

1. 在 `apps/sino-purchase-v2/src/pages/` 下创建新页面
2. 在 `packages/` 下添加可复用组件
3. 更新 `App.tsx` 中的导航和路由

## 🔒 安全注意

- `.env` 文件已在 `.gitignore` 中，请勿提交敏感信息
- 生产环境使用环境变量配置 API 密钥

## 📄 License

MIT
