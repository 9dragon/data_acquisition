# 环境检查清单

本文档提供数据采集系统启动前的完整环境检查清单。

## 📋 必需软件清单

### 1. Java开发工具包（JDK）

| 项目 | 要求 | 推荐安装路径 |
|------|------|--------------|
| 版本 | JDK 17 | `C:\Program Files\Java\jdk-17` |
| 用途 | 后端运行环境 | - |
| 重要性 | ⚠️ 必须 | - |

#### 验证步骤

```bash
# 检查Java版本
java -version

# 应显示类似：
# java version "17.0.12" 2024-07-16 LTS
# Java(TM) SE Runtime Environment ...

# 检查JAVA_HOME
echo $JAVA_HOME  # Git Bash
echo %JAVA_HOME% # Windows CMD

# 应指向JDK目录，如：C:\Program Files\Java\jdk-17
```

#### 常见问题

**问题1**：`java -version` 显示JRE而非JDK
- **原因**：JAVA_HOME指向JRE
- **解决**：设置JAVA_HOME指向JDK目录

**问题2**：提示"No compiler is provided"
- **原因**：使用的是JRE而非JDK
- **解决**：
  ```bash
  export JAVA_HOME="/c/Program Files/Java/jdk-17"
  export PATH="$JAVA_HOME/bin:$PATH"
  ```

---

### 2. Maven构建工具

| 项目 | 要求 | 推荐安装路径 |
|------|------|--------------|
| 版本 | Maven 3.6+ | `D:\devtools\apache-maven-3.6.0` |
| 用途 | 后端项目构建 | - |
| 重要性 | ⚠️ 必须 | - |

#### 验证步骤

```bash
# 检查Maven版本
/d/devtools/apache-maven-3.6.0/bin/mvn -version

# 应显示类似：
# Apache Maven 3.6.0
# Java version: 17.0.12

# 检查Maven目录
ls "/d/devtools/apache-maven-3.6.0/bin/"
```

#### 常见问题

**问题1**：`mvn: command not found`
- **原因**：Maven路径不正确
- **解决**：使用完整路径或添加到PATH

**问题2**：Maven依赖下载缓慢
- **原因**：网络问题或镜像配置
- **解决**：已配置阿里云镜像，检查 `~/.m2/settings.xml`

---

### 3. Node.js运行环境

| 项目 | 要求 | 推荐安装路径 |
|------|------|--------------|
| 版本 | Node.js 18+ | 默认安装路径 |
| 用途 | 前端运行环境 | - |
| 重要性 | ⚠️ 必须 | - |

#### 验证步骤

```bash
# 检查Node.js版本
node -v

# 应显示：v18.x.x 或更高

# 检查npm版本
npm -v

# 应显示：9.x.x 或更高
```

#### 常见问题

**问题1**：`node: command not found`
- **原因**：Node.js未安装或未添加到PATH
- **解决**：安装Node.js并重启终端

**问题2**：npm install失败
- **原因**：网络问题或权限问题
- **解决**：
  ```bash
  # 清除缓存重试
  npm cache clean --force
  npm install
  ```

---

## 🌐 依赖服务检查

### 1. MySQL数据库

| 项目 | 生产环境 | 开发环境 |
|------|----------|----------|
| 地址 | 10.1.2.230:3306 | localhost:3306 |
| 用户名 | data_acquisition | root |
| 密码 | G1e86czRd5ttZVlV | (本地密码) |
| 数据库 | data_acquisition | data_acquisition |
| 重要性 | ⚠️ 必须 | ⚠️ 必须 |

#### 验证步骤

```bash
# 测试连接（生产环境）
mysql -h 10.1.2.230 -u data_acquisition -pG1e86czRd5ttZVlV -e "SELECT 1"

# 或使用Windows工具连接到：
# 主机：10.1.2.230
# 端口：3306
# 用户：data_acquisition
# 密码：G1e86czRd5ttZVlV

# 检查数据库是否存在
mysql -h 10.1.2.230 -u data_acquisition -pG1e86czRd5ttZVlV -e "USE data_acquisition; SHOW TABLES;"
```

#### 数据库初始化

**⚠️ 首次启动前必须初始化数据库！**

执行脚本：`deployment/config/mysql/init.sql`

```bash
# 方式1：使用MySQL客户端
mysql -h 10.1.2.230 -u root -p < deployment/config/mysql/init.sql

# 方式2：使用数据库管理工具
# 1. 连接到MySQL服务器
# 2. 打开文件：deployment/config/mysql/init.sql
# 3. 执行脚本
```

验证初始化：
```sql
-- 应看到以下表
USE data_acquisition;
SHOW TABLES;

-- 应包含：
-- t_user, t_role, t_project, t_device, t_task, ...
```

#### 常见问题

**问题1**：`Access denied for user`
- **原因**：用户名密码错误
- **解决**：检查配置文件中的数据库连接信息

**问题2**：`Unknown database 'data_acquisition'`
- **原因**：数据库未创建
- **解决**：执行数据库初始化脚本

---

### 2. Redis缓存

| 项目 | 生产环境 | 开发环境 |
|------|----------|----------|
| 地址 | 10.1.2.230:6379 | localhost:6379 |
| 密码 | 6WJHKT8ahxYDOFwF | (本地密码) |
| 重要性 | ⚠️ 必须 | ⚠️ 必须 |

#### 验证步骤

```bash
# 测试连接（需要redis-cli）
redis-cli -h 10.1.2.230 -p 6379 -a 6WJHKT8ahxYDOFwF ping

# 应返回：PONG

# 或者使用telnet测试
telnet 10.1.2.230 6379
```

#### 常见问题

**问题1**：`Connection refused`
- **原因**：Redis服务未启动
- **解决**：启动Redis服务

**问题2**：`NOAUTH Authentication required`
- **原因**：Redis需要密码
- **解决**：检查配置文件中的Redis密码

---

### 3. MinIO对象存储（可选）

| 项目 | 生产环境 | 开发环境 |
|------|----------|----------|
| 地址 | http://10.1.2.230:9000 | http://localhost:9000 |
| Access Key | 65RD1skNPDqG | minioadmin |
| Secret Key | 9VQaHWcHU27t2tYC | minioadmin |
| 重要性 | ℹ️ 可选 | ℹ️ 可选 |

#### 验证步骤

```bash
# 访问MinIO控制台
# 浏览器打开：http://10.1.2.230:9000

# 或使用curl测试
curl -I http://10.1.2.230:9000
```

#### 常见问题

**问题1**：MinIO连接失败
- **影响**：文件上传下载功能不可用
- **解决**：检查MinIO服务是否启动

---

## 🔧 端口占用检查

### 前端端口

| 端口 | 服务 | 状态 |
|------|------|------|
| 3000 | Vue 3前端（正式项目） | ✅ 启动 |
| 5173 | React前端（原型项目） | ⚠️ 不应启动 |

#### 检查命令

```bash
# 检查前端端口
netstat -ano | findstr ":3000"
netstat -ano | findstr ":5173"
```

**⚠️ 重要提示**：确保启动的是端口3000的Vue 3项目，而非端口5173的React项目！

### 后端端口

| 端口 | 服务 | 状态 |
|------|------|------|
| 8080 | Spring Boot后端 | ✅ 启动 |

#### 检查命令

```bash
# 检查后端端口
netstat -ano | findstr ":8080"
```

---

## ✅ 启动前最终检查清单

执行以下命令完成最终检查：

```bash
# 1. 检查Java版本
java -version
# ✅ 期望：Java 17

# 2. 检查Maven版本
/d/devtools/apache-maven-3.6.0/bin/mvn -version
# ✅ 期望：Maven 3.6+

# 3. 检查Node.js版本
node -v
# ✅ 期望：v18.x.x+

# 4. 检查MySQL连接
mysql -h 10.1.2.230 -u data_acquisition -pG1e86czRd5ttZVlV -e "SELECT 1"
# ✅ 期望：连接成功

# 5. 检查数据库表
mysql -h 10.1.2.230 -u data_acquisition -pG1e86czRd5ttZVlV -e "USE data_acquisition; SHOW TABLES;"
# ✅ 期望：显示表列表

# 6. 检查Redis连接
redis-cli -h 10.1.2.230 -p 6379 -a 6WJHKT8ahxYDOFwF ping
# ✅ 期望：PONG

# 7. 检查端口占用
netstat -ano | findstr ":3000 :8080 :5173"
# ✅ 期望：3000和8080未被占用，5173不应启动
```

---

## 🚨 故障排查

### 问题：环境检查全部通过，但启动失败

1. **查看后端日志**：
   ```bash
   cat backend.log
   ```

2. **检查防火墙**：
   - 确保允许3000和8080端口

3. **重启终端**：
   - 环境变量更改后需要重启终端

4. **清理缓存**：
   ```bash
   # 清理Maven缓存
   rm -rf ~/.m2/repository

   # 清理npm缓存
   npm cache clean --force
   ```

### 问题：某些检查项不适用

- 如果不使用MinIO，可以跳过MinIO检查
- 开发环境可能使用本地MySQL/Redis，调整相应地址

---

## 📞 获取帮助

如遇环境问题：

1. 查看本文档的"常见问题"部分
2. 查看[source/README.md](README.md)的详细说明
3. 查看子项目README的常见问题部分
4. 检查服务日志和控制台输出

---

**最后更新**：2026-03-24
