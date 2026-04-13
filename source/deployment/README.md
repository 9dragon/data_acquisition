# 数据采集系统 - 部署指南

## 概述

本部署方案使用 Docker Compose 在服务器上一键部署完整的数据采集系统。

### 部署组件

| 组件 | 版本 | 端口 | 说明 |
|------|------|------|------|
| MySQL | 8.0 | 3306 | 数据库 |
| Redis | 7 | 6379 | 缓存 |
| MinIO | 最新 | 9000, 9001 | 对象存储 |
| 后端服务 | latest | 8080 | Spring Boot API |
| 前端服务 | latest | 80 | Vue Web 界面 |

### 部署脚本说明

| 脚本 | 位置 | 说明 |
|------|------|------|
| `deploy.sh` | deployment/ | 部署依赖服务（MySQL/Redis/MinIO）|
| `deploy-production.sh` | deployment/scripts/ | **完整部署**（依赖+应用），推荐使用 |

> **推荐使用 `deploy-production.sh`**，它会自动安装 Docker 和 Docker Compose，并部署完整系统。

## 环境要求

- **操作系统**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **权限**: sudo 权限
- **网络**: 服务器需要能访问 Docker Hub
- **内存**: 最低 4GB，推荐 8GB
- **磁盘**: 最低 20GB，推荐 50GB

**注意**: Docker 和 Docker Compose 会在部署时自动安装，无需预先配置。

## 快速开始

### 1. 上传项目文件

将整个项目上传到服务器：

```bash
# 使用 git clone（推荐）
git clone <repository-url> /opt/data-acquisition-source

# 或使用 scp 上传
scp -r deployment/ user@your-server:/tmp/data-acquisition/
```

### 2. 执行部署脚本

```bash
# 进入脚本目录
cd /opt/data-acquisition-source/deployment/scripts

# 添加执行权限
chmod +x deploy-production.sh

# 执行部署（需要 sudo 权限）
sudo ./deploy-production.sh
```

部署脚本会自动完成：
1. ✅ 安装 Docker 和 Docker Compose
2. ✅ 配置国内镜像加速器
3. ✅ 创建项目目录 `/opt/data-acquisition`
4. ✅ 生成安全密码
5. ✅ 构建应用镜像
6. ✅ 初始化数据库
7. ✅ 启动所有服务

### 3. 访问系统

部署完成后，可以通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端页面 | http://your-server-ip | Web 界面 |
| 后端 API | http://your-server-ip:8080/api/v1 | API 接口 |
| MinIO 控制台 | http://your-server-ip:9001 | 对象存储管理 |

**默认账号**:
- 用户名: `admin`
- 密码: `admin123`

> ⚠️ **安全提示**: 部署后请立即修改默认密码！

### 4. 获取连接凭据

所有服务的凭据信息保存在 `/opt/data-acquisition/credentials.txt`：

```bash
sudo cat /opt/data-acquisition/credentials.txt
```

**⚠️ 安全提示**: 请尽快下载凭据文件并删除服务器上的副本！

```bash
# 下载到本地（在本地执行）
scp user@your-server:/opt/data-acquisition/credentials.txt ./

# 删除服务器副本
sudo rm /opt/data-acquisition/credentials.txt
```

## 服务管理

### 使用管理脚本

统一管理脚本 `manage.sh` 提供了所有常用操作：

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

# 进入容器
sudo ./scripts/manage.sh exec mysql
sudo ./scripts/manage.sh exec redis
```

### 项目目录结构

```
/opt/data-acquisition/
├── docker-compose.yml          # Docker 编排文件
├── docker-compose.prod.yml     # 生产环境配置
├── .env.production             # 环境变量（包含密码）
├── credentials.txt             # 凭据信息（部署后应删除）
├── version.json                # 版本信息
├── scripts/                    # 管理脚本
│   ├── manage.sh              # 统一管理
│   ├── update-production.sh   # 系统更新
│   ├── backup.sh              # 备份
│   ├── rollback.sh            # 回滚
│   └── health-check.sh        # 健康检查
├── data/                      # 数据持久化目录
│   ├── mysql/                # MySQL 数据文件
│   ├── redis/                # Redis 数据文件
│   └── minio/                # MinIO 数据文件
├── logs/                      # 日志目录
│   ├── backend/              # 后端日志
│   └── nginx/                # Nginx 日志
└── backups/                   # 备份目录
```

## 系统更新

### 自动更新（推荐）

```bash
cd /opt/data-acquisition-source/deployment/scripts
sudo ./update-production.sh
```

更新脚本会自动：
1. 创建备份
2. 拉取最新代码
3. 构建新版本镜像
4. 滚动更新（零停机）
5. 健康检查验证
6. 清理旧镜像

如果更新失败，会自动回滚到上一个版本。

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

### 恢复备份

```bash
cd /opt/data-acquisition
sudo ./scripts/rollback.sh
```

然后按提示选择要恢复的备份版本。

## 连接验证

### MySQL

```bash
# 使用管理脚本
sudo ./scripts/manage.sh exec mysql

# 或直接连接
docker exec -it data-acquisition-mysql mysql -u data_acquisition -p
```

### Redis

```bash
# 使用管理脚本
sudo ./scripts/manage.sh exec redis

# 测试连接
docker exec -it data-acquisition-redis redis-cli -a your_password ping
# 输出: PONG
```

### MinIO

- **API 地址**: `http://your-server-ip:9000`
- **控制台地址**: `http://your-server-ip:9001`

使用 `credentials.txt` 中的用户名和密码登录控制台。

### 常用命令

```bash
# 进入项目目录
cd /opt/data-acquisition

# 查看服务状态
docker compose ps

# 查看服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f mysql
docker compose logs -f redis
docker compose logs -f minio

# 重启服务
docker compose restart

# 停止所有服务
docker compose down

# 停止并删除数据（危险操作！）
docker compose down -v

# 更新服务镜像
docker compose pull
docker compose up -d
```

## 连接验证

### MySQL

```bash
# 命令行连接
mysql -h 127.0.0.1 -u root -p

# 或使用 Docker exec
docker exec -it data-acquisition-mysql mysql -u root -p
```

### Redis

```bash
# 使用 Docker exec
docker exec -it data-acquisition-redis redis-cli -a your_password

# 测试连接
docker exec -it data-acquisition-redis redis-cli -a your_password ping
# 输出: PONG
```

### MinIO

- **API 地址**: `http://your-server-ip:9000`
- **控制台地址**: `http://your-server-ip:9001`

使用 `credentials.txt` 中的用户名和密码登录控制台。

## 健康检查

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

## 防火墙配置

### 生产环境（推荐）

仅开放必要端口：

```bash
# 开放端口
sudo ufw allow 80/tcp    # 前端 HTTP
sudo ufw allow 443/tcp   # 前端 HTTPS

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 开发环境

如需直接访问数据库和 MinIO，开放相应端口：

```bash
sudo ufw allow 3306/tcp  # MySQL
sudo ufw allow 6379/tcp  # Redis
sudo ufw allow 9000/tcp  # MinIO API
sudo ufw allow 9001/tcp  # MinIO Console
sudo ufw allow 8080/tcp  # 后端 API
```

## 生产环境建议

1. **修改默认密码**: 部署后立即修改所有默认密码
2. **配置 HTTPS**: 使用 Let's Encrypt 免费证书
3. **限制访问**: 防火墙只开放 80/443 端口
4. **定期备份**: 使用 `backup.sh` 定期执行备份
5. **监控告警**: 配置健康检查和告警通知
6. **日志管理**: 定期清理或归档日志文件

### 配置 HTTPS

```bash
# 安装 certbot
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d your-domain.com

# 配置 Nginx 使用证书
# 编辑 config/nginx/nginx.prod.conf
```

### 性能优化

编辑 `/opt/data-acquisition/.env.production`：

```bash
# JVM 参数调整
JAVA_OPTS=-Xms1g -Xmx2g -XX:+UseG1GC
```

## 故障排查

### 服务无法启动

```bash
# 查看所有服务状态
sudo ./scripts/manage.sh status

# 查看服务日志
sudo ./scripts/manage.sh logs

# 健康检查
sudo ./scripts/manage.sh health
```

### 容器反复重启

```bash
# 查看容器详情
docker inspect data-acquisition-backend

# 查看容器日志
docker logs data-acquisition-backend
```

### 磁盘空间不足

```bash
# 清理旧镜像
sudo ./scripts/manage.sh cleanup

# 查看磁盘使用
df -h
```

### 密码丢失

查看 `/opt/data-acquisition/.env.production` 或重新生成：

```bash
cd /opt/data-acquisition

# 停止服务
sudo ./scripts/manage.sh stop

# 重新生成密码
# 编辑 .env.production 文件

# 启动服务
sudo ./scripts/manage.sh start
```

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

## 卸载

```bash
# 停止所有服务
cd /opt/data-acquisition
sudo ./scripts/manage.sh stop

# 停止并删除容器
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# 删除项目和数据
sudo rm -rf /opt/data-acquisition

# 删除防火墙规则（如已配置）
sudo ufw delete allow 80/tcp
sudo ufw delete allow 443/tcp
```

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

## 完整文档

更多详细信息请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)
