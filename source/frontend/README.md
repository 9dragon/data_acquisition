# 数据采集系统 - 前端（正式项目）

> ⚠️ **重要提示**：这是正式的Vue 3项目，不是原型项目。
> 原型项目位于：`requirement/prototype/frontend`（React项目，仅供开发参考，不要启动）

基于 Vue 3 + TypeScript 的数据采集管理系统前端应用。

## 项目简介

本系统用于管理设备数据采集的全流程，包括项目管理、设备管理、工单流程、文档管理等功能。

## 技术栈

- **框架**: Vue 3.5 (Composition API + `<script setup>`)
- **语言**: TypeScript 5.9
- **构建工具**: Vite 8.0
- **UI组件**: Element Plus 2.13
- **路由**: Vue Router 4.6
- **状态管理**: Pinia 3.0
- **HTTP客户端**: Axios 1.13
- **工具库**: @vueuse/core
- **图表**: ECharts 6.0

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 安装依赖

```bash
npm install
```

## 启动方式

### 开发环境

```bash
npm run dev
```

访问地址: http://localhost:3000

开发环境会自动代理后端API请求到 `http://localhost:8080`

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录

### 预览构建结果

```bash
npm run preview
```

## 目录结构

```
src/
├── api/              # API请求封装
├── assets/           # 静态资源
├── components/       # 公共组件
│   └── Layout/       # 布局组件
├── composables/      # 组合式函数
│   ├── useForm.ts    # 表单处理
│   ├── useTable.ts   # 表格处理
│   └── usePermission.ts # 权限处理
├── router/           # 路由配置
├── stores/           # Pinia状态管理
├── types/            # TypeScript类型定义
├── utils/            # 工具函数
├── views/            # 页面组件
│   ├── Dashboard/    # 仪表板
│   ├── Device/       # 设备管理
│   ├── Document/     # 文档管理
│   ├── Issue/        # 问题管理
│   ├── Login/        # 登录页
│   ├── Process/      # 流程管理
│   ├── Project/      # 项目管理
│   ├── Task/         # 任务管理
│   ├── User/         # 用户管理
│   └── Workshop/     # 车间管理
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## 开发规范

### 命名规范

- 组件文件: PascalCase (如 `UserList.vue`)
- TypeScript文件: camelCase (如 `userApi.ts`)
- 组合式函数: use前缀 (如 `useTable.ts`)

### 代码风格

- 使用 Composition API 和 `<script setup>` 语法
- 组件使用 TypeScript 定义 props 和 emits
- 使用 Pinia 进行状态管理
- 统一使用 Element Plus 组件库

### 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链更新
```

## 配置说明

### 环境变量

创建 `.env.local` 文件配置本地环境变量:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 代理配置

`vite.config.ts` 中已配置开发环境代理:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## 常见问题

### Q: npm install 失败?
A: 尝试清除缓存后重新安装:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Q: 接口请求跨域?
A: 开发环境已配置代理，确保后端服务运行在 8080 端口

### Q: 构建后页面空白?
A: 检查服务器是否配置了 SPA 模式，所有路由应指向 index.html
