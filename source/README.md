# 数据采集系统 - 源码启动指南

本目录包含数据采集管理系统的前后端源代码。本文档提供详细的启动说明和配置指南。

## ⚠️ 项目说明

### 前后端项目

- **frontend/** - Vue 3前端（正式项目）- 端口3000
- **backend/** - Spring Boot后端 - 端口8080

### ⚠️ 重要提示：项目区分

本仓库包含两个前端项目，请注意区分：

| 项目 | 路径 | 端口 | 技术栈 | 状态 |
|------|------|------|--------|------|
| **正式项目** | `source/frontend` | 3000 | Vue 3 + Element Plus | ✅ 启动这个 |
| 原型项目 | `requirement/prototype/frontend` | 5173 | React + Ant Design | ⚠️ 不要启动 |

**请确保启动的是 `source/frontend` 项目（Vue 3，端口3000）！**

## 🚀 快速启动

### 方式1：一键启动（推荐）

使用启动脚本自动启动前后端服务：

```bash
# 在source目录下执行
cd D:\work\projects\data_acquisition\source

# Linux/Git Bash
bash start.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File start.ps1
```

启动脚本会自动：
- ✅ 检查环境（Java、Node.js、Maven）
- ✅ 设置JAVA_HOME环境变量
- ✅ 检查端口占用
- ✅ 启动后端服务
- ✅ 启动前端服务
- ✅ 显示访问地址

### 方式2：手动启动

如果需要单独启动或调试，可以手动启动各个服务。

#### 后端启动（Spring Boot）

```bash
# 在source目录下执行
cd D:\work\projects/data_acquisition\source

# 设置JAVA_HOME（重要：必须指向JDK而非JRE）
export JAVA_HOME="/c/Program Files/Java/jdk-17"
export PATH="$JAVA_HOME/bin:$PATH"

# 启动后端（开发环境，连接远程MySQL/Redis）
/d/devtools/apache-maven-3.6.0/bin/mvn -f backend/pom.xml \
  spring-boot:run -Dspring-boot.run.profiles=dev
```

**PowerShell启动命令：**
```powershell
cd D:\work\projects\data_acquisition\source
$env:JAVA_HOME="C:\Program Files\Java\jdk-17"
D:\devtools\apache-maven-3.6.0\bin\mvn.cmd -f backend\pom.xml spring-boot:run -Dspring-boot.run.profiles=dev
```

#### 前端启动（Vue 3）

```bash
# 进入前端目录
cd D:\work\projects\data_acquisition\source\frontend

# 安装依赖（首次启动）
npm install

# 启动开发服务器
npm run dev
```

前端会自动启动在 http://localhost:3000

## 📋 访问地址

启动成功后，可通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端界面** | http://localhost:3000 | Vue 3管理界面 |
| **后端API** | http://localhost:8080/api | REST API接口 |
| **API文档** | http://localhost:8080/api/doc.html | Knife4j API文档 |

### 默认管理员账号

```
用户名：admin
密码：admin123
```

## 🔧 环境要求

### 必需软件

| 软件 | 版本要求 | 推荐安装路径 |
|------|----------|--------------|
| **JDK** | 17 | `C:\Program Files\Java\jdk-17` |
| **Maven** | 3.6+ | `D:\devtools\apache-maven-3.6.0` |
| **Node.js** | 18+ | - |
| **npm** | 9.0+ | 随Node.js安装 |

### 依赖服务（开发环境）

| 服务 | 地址 | 用途 |
|------|------|------|
| **MySQL** | 10.1.2.230:3306 | 数据库 |
| **Redis** | 10.1.2.230:6379 | 缓存 |
| **MinIO** | 10.1.2.230:9000 | 文件存储 |

## 📝 启动前检查

### 1. 环境检查

```bash
# 检查Java版本（需要JDK 17）
java -version

# 检查Maven版本
/d/devtools/apache-maven-3.6.0/bin/mvn -version

# 检查Node.js版本
node -v

# 检查npm版本
npm -v
```

### 2. 端口检查

```bash
# 检查端口是否被占用
netstat -ano | findstr ":3000"  # 前端端口
netstat -ano | findstr ":8080"  # 后端端口
```

如果端口被占用，请先停止占用进程：
```bash
# 查看占用进程的PID
netstat -ano | findstr ":3000"

# 停止进程（替换<PID>为实际进程ID）
taskkill //F //PID <PID>
```

### 3. 数据库初始化

**⚠️ 首次启动前必须初始化数据库！**

执行数据库初始化脚本：
```bash
# 脚本位置
D:\work\projects\data_acquisition\source\deployment\config\mysql\init.sql
```

详细步骤请参考：[backend/README.md](backend/README.md#数据库初始化)

## 🔍 启动验证

### 检查服务状态

```bash
# 检查端口占用
netstat -ano | findstr ":3000"  # 前端
netstat -ano | findstr ":8080"  # 后端

# 测试HTTP响应
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/doc.html
```

### 验证成功标准

- [ ] 前端可访问：http://localhost:3000（显示登录页面）
- [ ] 后端可访问：http://localhost:8080/api/doc.html（显示API文档）
- [ ] 可以使用管理员账号登录（admin/admin123）
- [ ] 前端能够正常调用后端API

## ⚙️ 配置说明

### Profile配置

后端支持两种环境配置：

- **prod（生产环境）**：连接远程服务（10.1.2.230）
  - MySQL: 10.1.2.230:3306
  - Redis: 10.1.2.230:6379
  - MinIO: 10.1.2.230:9000

- **dev（开发环境）**：连接远程服务（10.1.2.230）
  - MySQL: 10.1.2.230:3306
  - Redis: 10.1.2.230:6379
  - MinIO: 10.1.2.230:9000

### 环境变量

可通过环境变量覆盖配置：

```bash
# 数据库配置
export DB_HOST=10.1.2.230
export DB_USERNAME=data_acquisition
export DB_PASSWORD=G1e86czRd5ttZVlV

# Redis配置
export REDIS_HOST=10.1.2.230
export REDIS_PASSWORD=6WJHKT8ahxYDOFwF

# MinIO配置
export MINIO_ENDPOINT=http://10.1.2.230:9000
export MINIO_ACCESS_KEY=65RD1skNPDqG
export MINIO_SECRET_KEY=9VQaHWcHU27t2tYC
```

## ❓ 常见问题

### 1. 启动报错 "No compiler is provided in this environment"

**原因**：JAVA_HOME指向JRE而非JDK

**解决**：
```bash
# 设置JAVA_HOME指向JDK
export JAVA_HOME="/c/Program Files/Java/jdk-17"
export PATH="$JAVA_HOME/bin:$PATH"

# 验证
java -version  # 应显示Java 17
```

### 2. 前端启动后无法访问

**检查**：
```bash
# 确认启动的是正确的项目
# 正确：source/frontend（端口3000）

# 查看实际端口
netstat -ano | findstr "LISTENING" | findstr "3000"
```

### 3. 后端连接数据库失败

**检查**：
- MySQL服务是否启动
- 网络是否可达（ping 10.1.2.230）
- 数据库是否已初始化
- 用户名密码是否正确

### 4. Maven依赖下载缓慢

**解决**：已配置阿里云镜像源，如仍有问题检查 `~/.m2/settings.xml`

### 5. 前端代理失效

**检查**：`source/frontend/vite.config.ts` 中的代理配置：
```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## 📚 详细文档

- [前端README](frontend/README.md) - Vue 3前端详细说明
- [后端README](backend/README.md) - Spring Boot后端详细说明
- [环境检查清单](ENVIRONMENT_CHECKLIST.md) - 完整的环境要求清单

## 🆘 获取帮助

如遇问题，请按以下顺序排查：

1. 查看[环境检查清单](ENVIRONMENT_CHECKLIST.md)
2. 查看子项目README的常见问题部分
3. 检查服务日志（控制台输出）
4. 检查端口占用和进程状态
5. 验证数据库连接

---

**最后更新**：2026-03-24
