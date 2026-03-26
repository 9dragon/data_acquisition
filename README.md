# 数据采集管理系统

工业数据采集项目管理系统，用于管理设备数据采集的全流程，包括项目管理、设备管理、工单流程、文档管理等功能。

## 📁 项目结构

```
D:\work\projects\data_acquisition\
├── source/              # 源代码目录（前后端项目）
│   ├── frontend/        # Vue 3前端（正式项目）
│   ├── backend/         # Spring Boot后端
│   └── deployment/      # 部署配置
├── requirement/         # 需求文档
├── design/              # 设计文档
├── plan/                # 计划文档
└── deploy/              # 部署相关
```

### 目录说明

- **source/** - 源代码目录，包含前后端项目的完整实现
- **requirement/** - 产品需求文档和用户故事
- **design/** - 系统设计文档，包括架构设计、接口设计等
- **plan/** - 项目计划和开发计划
- **deploy/** - 部署脚本和配置文件

## 🚀 快速启动

**详细的启动说明请查看：[source/README.md](source/README.md)**

快速启动命令：
```bash
# 进入source目录
cd D:\work\projects\data_acquisition\source

# 方式1：使用启动脚本（推荐）
bash start.sh          # Linux/Git Bash
powershell start.ps1   # Windows PowerShell

# 方式2：手动启动
# 后端：参考 source/backend/README.md
# 前端：参考 source/frontend/README.md
```

## 📋 访问地址

启动成功后，可通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端界面 | http://localhost:3000 | Vue 3管理界面 |
| 后端API | http://localhost:8080/api | REST API接口 |
| API文档 | http://localhost:8080/api/doc.html | Knife4j API文档 |

**默认管理员账号：**
- 用户名：`admin`
- 密码：`admin123`

## 🛠️ 技术栈

### 前端（source/frontend）
- **框架**：Vue 3.5 (Composition API + `<script setup>`)
- **语言**：TypeScript 5.9
- **构建工具**：Vite 8.0
- **UI组件**：Element Plus 2.13
- **状态管理**：Pinia 3.0
- **路由**：Vue Router 4.6
- **HTTP客户端**：Axios 1.13
- **图表**：ECharts 6.0

### 后端（source/backend）
- **框架**：Spring Boot 3.1.8
- **语言**：Java 17
- **构建工具**：Maven 3.6+
- **持久层**：MyBatis-Plus 3.5.5
- **安全认证**：Spring Security + JWT 0.12.3
- **数据库**：MySQL 8.0
- **缓存**：Redis 6.0+
- **对象存储**：MinIO 8.5.7
- **API文档**：Knife4j 4.3.0

## 📖 文档导航

### 启动相关
- [Source启动指南](source/README.md) - 前后端项目启动详细说明
- [环境检查清单](source/ENVIRONMENT_CHECKLIST.md) - 环境要求和验证步骤

### 项目文档
- [需求文档](requirement/) - 产品需求说明
- [设计文档](design/) - 系统设计说明
- [计划文档](plan/) - 开发计划

### 子项目文档
- [前端README](source/frontend/README.md) - Vue 3前端项目说明
- [后端README](source/backend/README.md) - Spring Boot后端项目说明

## ⚠️ 重要提示

### 项目区分

本仓库包含两个前端项目，请注意区分：

1. **正式项目**：`source/frontend` - Vue 3项目（要启动的这个）
   - 端口：3000
   - 技术栈：Vue 3 + TypeScript + Element Plus
   - 状态：✅ 正在维护

2. **原型项目**：`requirement/prototype/frontend` - React项目
   - 端口：5173
   - 技术栈：React + TypeScript + Ant Design
   - 状态：⚠️ 仅供开发参考，不要启动

**请确保启动的是 `source/frontend` 项目（Vue 3）！**

### 数据库初始化

首次启动前必须初始化数据库，请执行：
```bash
# 数据库初始化脚本位置
source/deployment/config/mysql/init.sql
```

详细步骤请参考：[source/backend/README.md](source/backend/README.md#数据库初始化)

## 🤝 贡献指南

开发规范和提交规范请参考各子项目的README文档。

## 📞 支持

如遇问题，请查看：
1. [环境检查清单](source/ENVIRONMENT_CHECKLIST.md)
2. [后端README - 常见问题](source/backend/README.md#常见问题)
3. [前端README - 常见问题](source/frontend/README.md#常见问题)

---

**最后更新**：2026-03-24
