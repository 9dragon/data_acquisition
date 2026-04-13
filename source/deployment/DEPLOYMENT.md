# 生产环境部署指南

本文档描述如何使用脚本在生产环境中部署和更新数据采集系统。

## 快速参考

### 脚本位置
所有脚本位于 `deployment/scripts/` 目录下

### 常用命令速查

| 操作 | 命令 |
|------|------|
| **首次部署** | `sudo ./scripts/deploy-production.sh` |
| **更新系统** | `sudo ./scripts/update-production.sh` |
| **启动服务** | `sudo ./scripts/manage.sh start` |
| **停止服务** | `sudo ./scripts/manage.sh stop` |
| **查看状态** | `sudo ./scripts/manage.sh status` |
| **查看日志** | `sudo ./scripts/manage.sh logs [service]` |
| **健康检查** | `sudo ./scripts/manage.sh health` |
| **执行备份** | `sudo ./scripts/manage.sh backup` |
| **版本回滚** | `sudo ./scripts/rollback.sh` |
| **进入容器** | `sudo ./scripts/manage.sh exec <service>` |

### 服务名称
- `backend` - 后端 API 服务
- `frontend` - 前端 Web 服务
- `mysql` - MySQL 数据库
- `redis` - Redis 缓存
- `minio` - MinIO 对象存储

### 默认访问地址
- 前端: http://your-server-ip
- 后端API: http://your-server-ip:8080/api/v1
- MinIO控制台: http://your-server-ip:9001

### 默认账号
- 用户名: `admin`
- 密码: `admin123`

---

## 目录结构

```
deployment/
├── scripts/
│   ├── deploy-production.sh      # 首次部署脚本
│   ├── update-production.sh      # 更新脚本（零停机）
│   ├── manage.sh                 # 统一管理脚本
│   ├── backup.sh                 # 备份脚本
│   ├── rollback.sh               # 回滚脚本
│   └── health-check.sh           # 健康检查脚本
├── config/
│   ├── nginx/
│   │   └── nginx.prod.conf       # 生产环境Nginx配置
│   └── mysql/
│       └── init.sql              # 数据库初始化脚本
├── docker-compose.yml            # 完整服务编排
├── docker-compose.prod.yml       # 生产环境覆盖配置
├── .env.production.template      # 环境变量模板
└── README.md                     # 本文档
```

## 环境要求

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 最低 4GB，推荐 8GB
- **磁盘**: 最低 20GB，推荐 50GB
- **CPU**: 最低 2 核，推荐 4 核

## 首次部署

### 步骤 1: 准备服务器

确保服务器已安装 Docker 和 Docker Compose：

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo apt-get install docker-compose-plugin
```

### 步骤 2: 上传项目文件

将项目文件上传到服务器：

```bash
# 方式1: 使用 git clone
git clone <repository-url> /opt/data-acquisition-source

# 方式2: 使用 scp/rsync 上传
```

### 步骤 3: 执行部署脚本

```bash
cd /opt/data-acquisition-source/deployment
sudo ./scripts/deploy-production.sh
```

部署脚本会自动完成以下操作：
1. 检查系统环境
2. 创建项目目录 `/opt/data-acquisition`
3. 生成随机密码并保存到凭证文件
4. 构建 Docker 镜像
5. 初始化数据库
6. 启动所有服务
7. 执行健康检查

### 步骤 4: 访问系统

部署完成后，可以通过以下地址访问：

- **前端页面**: http://your-server-ip
- **后端 API**: http://your-server-ip:8080/api/v1
- **MinIO 控制台**: http://your-server-ip:9001

**默认账号**:
- 用户名: `admin`
- 密码: `admin123`

> ⚠️ **安全提示**: 部署后请立即修改默认密码！

## 系统管理

### 使用 manage.sh 管理服务

```bash
cd /opt/data-acquisition

# 启动服务
sudo ./scripts/manage.sh start

# 停止服务
sudo ./scripts/manage.sh stop

# 重启服务
sudo ./scripts/manage.sh restart

# 查看状态
sudo ./scripts/manage.sh status

# 查看日志
sudo ./scripts/manage.sh logs
sudo ./scripts/manage.sh logs backend

# 健康检查
sudo ./scripts/manage.sh health

# 执行备份
sudo ./scripts/manage.sh backup

# 查看版本信息
sudo ./scripts/manage.sh version
```

### 进入容器

```bash
# 进入后端容器
sudo ./scripts/manage.sh exec backend

# 进入 MySQL
sudo ./scripts/manage.sh exec mysql

# 进入 Redis
sudo ./scripts/manage.sh exec redis
```

## 更新部署

### 自动更新（推荐）

```bash
cd /opt/data-acquisition-source/deployment
sudo ./scripts/update-production.sh
```

更新脚本会自动完成：
1. 创建备份
2. 拉取最新代码
3. 构建新版本镜像
4. 滚动更新（零停机）
5. 健康检查
6. 清理旧镜像

如果更新失败，会自动回滚到上一个版本。

### 手动更新步骤

如果需要手动控制更新过程：

```bash
# 1. 备份当前版本
sudo ./scripts/backup.sh

# 2. 拉取代码
cd /opt/data-acquisition-source
git pull

# 3. 构建镜像
cd backend
mvn clean package -DskipTests
cd ../frontend
npm run build

# 4. 重启服务
cd /opt/data-acquisition
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build backend frontend
```

## 备份与恢复

### 执行备份

```bash
cd /opt/data-acquisition
sudo ./scripts/backup.sh
```

备份内容包括：
- 数据库（完整 SQL 导出）
- MinIO 数据
- 配置文件
- 版本信息

备份文件保存在 `/opt/data-acquisition/backups/`，文件名格式：`backup-YYYYMMDD-HHMMSS.tar.gz`

### 恢复备份

```bash
cd /opt/data-acquisition
sudo ./scripts/rollback.sh
```

然后按提示选择要恢复的备份版本。

## 版本回滚

### 交互式回滚

```bash
cd /opt/data-acquisition
sudo ./scripts/rollback.sh
```

### 自动回滚到上一版本

```bash
sudo ./scripts/rollback.sh --auto
```

### 列出可用版本

```bash
sudo ./scripts/rollback.sh --list
```

## 健康检查

### 执行健康检查

```bash
cd /opt/data-acquisition
sudo ./scripts/health-check.sh
```

检查内容包括：
- Docker 服务状态
- MySQL 连接
- Redis 连接
- MinIO 服务
- 后端 API
- 前端服务

## 安全建议

### 1. 配置防火墙

```bash
# 仅开放必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 配置 HTTPS

使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d your-domain.com

# 配置 Nginx（编辑 config/nginx/nginx.prod.conf）
```

### 3. 保护凭证文件

```bash
# 删除或移动凭证文件
sudo rm /opt/data-acquisition/credentials.txt
# 或移动到安全位置
sudo mv /opt/data-acquisition/credentials.txt /secure/location/
```

### 4. 定期更新密码

定期更改数据库、Redis、MinIO 的密码。

## 故障排查

### 查看日志

```bash
# 所有服务日志
sudo ./scripts/manage.sh logs

# 特定服务日志
sudo ./scripts/manage.sh logs backend
sudo ./scripts/manage.sh logs mysql
```

### 检查服务状态

```bash
# Docker 容器状态
sudo docker compose ps

# 资源使用情况
sudo docker stats
```

### 重置服务

```bash
# 完全重置（注意：会删除数据）
cd /opt/data-acquisition
sudo docker compose down -v
sudo ./scripts/deploy-production.sh
```

## 性能优化

### 1. 调整 JVM 参数

编辑 `.env.production`:

```bash
JAVA_OPTS=-Xms1g -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200
```

### 2. 配置 Redis 持久化

编辑 `config/redis/redis.conf`:

```conf
save 900 1
save 300 10
save 60 10000
```

### 3. 数据库优化

编辑 `config/mysql/my.cnf`:

```conf
[mysqld]
innodb_buffer_pool_size = 2G
max_connections = 500
```

## 监控建议

### 1. 使用 Prometheus + Grafana

监控容器资源使用情况

### 2. 配置日志收集

使用 ELK Stack 或 Loki 收集应用日志

### 3. 设置告警

配置邮件或钉钉告警通知

## 常见问题

### Q: 部署后无法访问前端？

A: 检查防火墙设置，确保 80 端口已开放。

### Q: 数据库连接失败？

A: 检查 `.env.production` 中的密码是否正确，确认 MySQL 容器正在运行。

### Q: 如何查看生成的密码？

A: 查看 `/opt/data-acquisition/credentials.txt` 文件。

### Q: 更新失败怎么办？

A: 查看日志确定失败原因，使用 `rollback.sh` 回滚到上一版本。

### Q: 如何扩展为多实例部署？

A: 使用 Docker Swarm 或 Kubernetes，配置负载均衡器。

## 技术支持

如有问题，请联系技术支持团队。
