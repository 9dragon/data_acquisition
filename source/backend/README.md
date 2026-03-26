# 数据采集系统 - 后端

工业数据采集项目管理系统后端服务，基于 Spring Boot 3.1.8 构建。

## 项目简介

本系统提供设备数据采集管理的后端API服务，支持项目管理、设备管理、工单流程、文档管理等核心功能，采用 Spring Security + JWT 进行身份认证。

## 技术栈

- **框架**: Spring Boot 3.1.8
- **语言**: Java 17
- **构建工具**: Maven 3.6+
- **持久层**: MyBatis-Plus 3.5.5
- **安全认证**: Spring Security + JWT 0.12.3
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **对象存储**: MinIO 8.5.7
- **API文档**: Knife4j 4.3.0

## 环境要求

- JDK 17 (`C:\Program Files\Java\jdk-17`)
- Maven 3.6+ (`D:\devtools\apache-maven-3.6.0`)
- MySQL 8.0+
- Redis 6.0+
- MinIO (可选，用于文件存储)

## 数据库初始化

**⚠️ 重要：首次启动前必须初始化数据库！**

### 初始化步骤

1. **使用数据库管理工具连接到 MySQL**
   - 主机：10.1.2.230
   - 端口：3306
   - 用户名：root
   - 密码：mp9OPrqPVDtEj8uu

2. **执行初始化脚本**
   - 打开文件：`D:\work\projects\data_acquisition\source\deployment\config\mysql\init.sql`
   - 复制所有内容并在数据库管理工具中执行
   - 或者使用命令行（如果已安装 MySQL 客户端）：
     ```bash
     mysql -h 10.1.2.230 -u root -pmp9OPrqPVDtEj8uu < D:\work\projects\data_acquisition\source\deployment\config\mysql\init.sql
     ```

3. **验证初始化**
   - 确认数据库 `data_acquisition` 已创建
   - 确认表 `t_user`、`t_role` 等已创建
   - 确认默认管理员用户已插入

**默认管理员账号：**
- 用户名：`admin`
- 密码：`admin123`

## 快速启动

### 推荐方式：使用启动脚本

**⚠️ 推荐使用source目录下的启动脚本，自动处理环境配置和依赖检查！**

```bash
# 进入source目录
cd D:\work\projects\data_acquisition\source

# 使用启动脚本启动后端
bash start.sh backend          # Linux/Git Bash
powershell start.ps1 backend   # Windows PowerShell

# 或启动所有服务（前端+后端）
bash start.sh all              # Linux/Git Bash
powershell start.ps1 all       # Windows PowerShell
```

启动脚本会自动：
- ✅ 检查环境（Java、Maven版本）
- ✅ 设置JAVA_HOME环境变量
- ✅ 检查端口占用
- ✅ 启动服务

### 手动启动方式

如果需要单独启动或调试，可以手动启动后端服务。

#### Windows 环境启动

```bash
# 1. 进入source目录
cd D:\work\projects\data_acquisition\source

# 2. 设置 JAVA_HOME（Git Bash）
export JAVA_HOME="/c/Program Files/Java/jdk-17"
export PATH="$JAVA_HOME/bin:$PATH"

# 或者设置 JAVA_HOME（PowerShell）
$env:JAVA_HOME="C:\Program Files\Java\jdk-17"

# 3. 启动后端服务（生产环境，连接远程 MySQL/Redis/MinIO）
/d/devtools/apache-maven-3.6.0/bin/mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=prod

# 或者启动开发环境（连接本地 MySQL/Redis）
/d/devtools/apache-maven-3.6.0/bin/mvn -f backend/pom.xml spring-boot:run
```

**PowerShell 启动命令：**
```powershell
cd D:\work\projects\data_acquisition\source
$env:JAVA_HOME="C:\Program Files\Java\jdk-17"
D:\devtools\apache-maven-3.6.0\bin\mvn.cmd -f backend\pom.xml spring-boot:run -Dspring-boot.run.profiles=prod
```

#### Linux/Mac 环境启动

```bash
# 从source目录执行
cd source

# 生产环境
mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=prod

# 或者打包后运行
mvn -f backend/pom.xml clean package
java -jar backend/target/data-acquisition-1.0.0.jar --spring.profiles.active=prod
```

### 服务验证

```bash
# 检查服务状态
curl http://localhost:8080/api/doc.html

# 端口状态
netstat -an | grep 8080
```

## 环境配置

### 远程服务配置

| 服务 | 地址 | 用途 |
|------|------|------|
| MySQL | 10.1.2.230:3306 | 数据库 |
| Redis | 10.1.2.230:6379 | 缓存 |
| MinIO | 10.1.2.230:9000 | 文件存储 |

配置文件: `src/main/resources/application-prod.yml`

## 访问地址

| 服务 | 地址 |
|------|------|
| 后端服务 | http://localhost:8080 |
| API文档 | http://localhost:8080/api/doc.html |

## 目录结构

```
src/main/java/com/dataacquisition/
├── common/               # 公共模块
│   ├── constant/         # 常量定义
│   ├── entity/           # 基础实体
│   ├── exception/        # 异常处理
│   ├── handler/          # 自动填充处理器
│   └── response/         # 响应封装
├── config/               # 配置类
│   ├── JwtConfig.java    # JWT配置
│   ├── Knife4jConfig.java # API文档配置
│   ├── MinioConfig.java  # MinIO配置
│   ├── MybatisPlusConfig.java # MyBatis-Plus配置
│   ├── RedisConfig.java  # Redis配置
│   └── SecurityConfig.java # 安全配置
├── modules/              # 业务模块
│   ├── device/           # 设备管理
│   ├── document/         # 文档管理
│   ├── issue/            # 问题管理
│   ├── permission/       # 权限管理
│   ├── process/          # 流程管理
│   ├── project/          # 项目管理
│   ├── security/         # 安全相关(JWT过滤器等)
│   ├── system/           # 系统管理
│   ├── task/             # 任务管理
│   └── workshop/         # 车间管理
└── DataAcquisitionApplication.java
```

## API说明

### 认证方式

使用 JWT Token 进行认证:

```bash
# 登录获取token
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

# 后续请求携带token
Authorization: Bearer {token}
```

### 主要接口

| 模块 | 路径 | 说明 |
|------|------|------|
| 认证登录 | /api/auth/* | 登录、登出、刷新token |
| 项目管理 | /api/projects | 项目CRUD、状态变更 |
| 设备管理 | /api/devices | 设备CRUD、状态监控 |
| 任务管理 | /api/tasks | 任务分配、进度更新 |
| 流程管理 | /api/processes | 流程定义、审批 |
| 文档管理 | /api/documents | 文档上传、下载 |
| 系统管理 | /api/system | 用户、角色、权限 |

## 配置说明

### Profile配置

- `application.yml` - 默认配置
- `application-prod.yml` - 生产环境（连接远程服务）

### 环境变量

可通过环境变量覆盖配置:

```bash
export DB_HOST=10.1.2.230
export DB_USERNAME=data_acquisition
export DB_PASSWORD=G1e86czRd5ttZVlV
export REDIS_HOST=10.1.2.230
export REDIS_PASSWORD=6WJHKT8ahxYDOFwF
export MINIO_ENDPOINT=http://10.1.2.230:9000
```

## 数据库初始化

```sql
CREATE DATABASE data_acquisition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

后续表结构由 MyBatis-Plus 自动更新或执行SQL脚本初始化。

## 常见问题

### Q: 启动报错 "No compiler is provided in this environment"?
A: 确保设置 `JAVA_HOME` 指向 JDK 而非 JRE

### Q: 启动报错 "Connection refused"?
A: 检查 MySQL/Redis 服务是否启动，网络是否可达

### Q: JWT认证失败?
A: 检查 token 是否过期，确保请求头格式正确: `Authorization: Bearer {token}`

### Q: Maven依赖下载慢?
A: 已配置阿里云镜像源，如仍有问题检查 `~/.m2/settings.xml`

### Q: 循环依赖错误?
A: 已通过 `@Lazy` 注解和 `spring.main.allow-circular-references=true` 解决
