# proto - 原型项目服务管理 Skill

## 名称
`proto` - 数据采集原型项目前端服务管理

## 描述
统一管理数据采集原型项目的前端开发服务，支持启动、停止、重启和状态查看操作。自动使用 nvm 切换到 Node 18.20.3 版本。

## 使用方法

### 基本命令
- `/proto` - 启动前端服务（默认）
- `/proto start` - 启动前端服务
- `/proto status` - 查看服务运行状态
- `/proto restart` - 重启前端服务
- `/proto stop` - 停止前端服务

### 功能说明

#### 启动服务 (`start`)
- 使用 nvm 切换到 Node 18.20.3
- 检查服务是否已运行（端口 5173）
- 如果已运行，提示用户使用 `/proto restart`
- 启动前端：`cd frontend && npm run dev`（端口 5173）
- 显示启动状态和访问地址

#### 查看状态 (`status`)
显示服务状态表格：
```
┌──────────┬────────┬──────┬─────────┐
│ 服务     │ 状态   │ 端口 │ PID     │
├──────────┼────────┼──────┼─────────┤
│ 前端Web  │ 运行中 │ 5173 │ 12345   │
└──────────┴────────┴──────┴─────────┘
```

#### 重启服务 (`restart`)
- 停止现有服务
- 等待端口释放
- 重新启动服务
- 显示新服务状态

#### 停止服务 (`stop`)
- 查找并停止相关进程
- 确认端口已释放
- 显示停止结果

## 调用方式

通过 PowerShell 直接调用脚本文件：

```powershell
# 查看状态
powershell -ExecutionPolicy Bypass -File ".claude\skills\proto\proto.ps1" status

# 启动服务
powershell -ExecutionPolicy Bypass -File ".claude\skills\proto\proto.ps1" start

# 停止服务
powershell -ExecutionPolicy Bypass -File ".claude\skills\proto\proto.ps1" stop

# 重启服务
powershell -ExecutionPolicy Bypass -File ".claude\skills\proto\proto.ps1" restart

# 显示帮助
powershell -ExecutionPolicy Bypass -File ".claude\skills\proto\proto.ps1" help
```

## 技术实现
- **Node 版本管理**: 使用 nvm 切换到 Node 18.20.3
- **端口检测**: 使用 `netstat` 命令
- **进程管理**: 使用 `taskkill /F` 强制终止
- **后台启动**: 使用 `Start-Process -WindowStyle Hidden`
- **执行方式**: PowerShell 脚本文件独立执行
- **操作系统**: Windows PowerShell 5.1+

## 服务配置
- **前端服务**:
  - 端口: 5173
  - 启动命令: `npm run dev` (在 frontend 目录)
  - 进程名: node
  - Node 版本: 18.20.3 (通过 nvm 管理)

## 访问地址
- 前端: http://localhost:5173

## 注意事项
1. 需要已安装 nvm for Windows
2. 需要在 nvm 中安装 Node 18.20.3
3. 首次启动前需要安装依赖：`cd frontend && npm install`
4. 端口 5173 需要未被占用
5. 停止服务会终止相关进程，请确保已保存工作
