# 数采项目管理系统前端原型

基于 React + Ant Design 的数采项目管理系统前端原型。

## 技术栈

- **React 18.2** + TypeScript 5.0
- **Ant Design 5.12** (UI组件库)
- **Vite 5.0** (构建工具)
- **React Router 6.20** (路由)
- **Zustand 4.4** (状态管理)
- **@ant-design/charts 2.0** (图表库)

## 功能模块

- ✅ 工作台：待办事项、我的项目、进度预警、通知公告
- ✅ 项目管理：项目列表、项目详情、项目仪表盘
- ✅ 设备管理：设备列表、设备详情、设备类型管理
- ✅ 计划管理：项目计划、进度填报、甘特图
- ✅ 问题管理：问题列表、问题详情、我的问题、问题统计
- ✅ 文档中心：项目文档、标签管理
- ✅ 系统管理：用户管理、角色权限、基础配置

## 安装依赖

```bash
cd D:\work\projects\data_acquisition\requirement\prototype\frontend
npm install
```

## 运行项目

```bash
npm run dev
```

访问: http://localhost:5173

## 构建项目

```bash
npm run build
```

## 项目结构

```
frontend/
├── public/              # 静态资源
├── src/
│   ├── assets/         # 静态资源
│   ├── components/     # 通用组件
│   │   ├── Layout/     # 布局组件 (Header, Sidebar, MainLayout)
│   │   ├── Common/     # 公共组件 (PageHeader, FilterBar, DataTable, StatusTag)
│   │   └── Modal/      # 弹窗组件
│   ├── pages/          # 页面组件
│   │   ├── Dashboard/      # 工作台
│   │   ├── Project/        # 项目管理
│   │   ├── Device/         # 设备管理
│   │   ├── Plan/           # 计划管理
│   │   ├── Issue/          # 问题管理
│   │   ├── Document/       # 文档中心
│   │   └── System/         # 系统管理
│   ├── stores/        # Zustand状态管理
│   ├── services/      # 数据服务和模拟数据
│   ├── types/         # TypeScript类型定义
│   ├── utils/         # 工具函数
│   ├── router/        # 路由配置
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 开发说明

### 模拟数据

项目使用模拟数据进行演示，所有模拟数据位于 `src/services/mockData.ts`。

### 状态管理

使用 Zustand 进行状态管理，stores 位于 `src/stores/` 目录。

### 组件规范

- 使用 Ant Design 组件库
- 遵循产品设计规范
- 界面简洁清晰，适合一线使用者

## 注意事项

- 当前版本为原型实现，数据为模拟数据
- 后续需要接入真实后端API
- 部分功能需要进一步优化和完善
