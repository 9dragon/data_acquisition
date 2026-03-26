# 数据采集系统 - 远程服务器部署指南

## 概述

本部署方案使用 Docker Compose 在 Ubuntu 22.04 服务器上一键部署以下组件：

| 组件 | 版本 | 端口 |
|------|------|------|
| MySQL | 8.0 | 3306 |
| Redis | 7 | 6379 |
| MinIO | 最新 | 9000, 9001 |

## 环境要求

- **操作系统**: Ubuntu 22.04 (推荐) 或其他 Debian 系发行版
- **权限**: sudo 权限
- **网络**: 服务器需要能访问 Docker Hub
- **内存**: 建议 4GB 以上
- **磁盘**: 建议 20GB 以上可用空间

## 快速开始

### 1. 上传文件到服务器

使用 SFTP 或 scp 命令将以下文件上传到服务器的任意目录（如 `/tmp/deploy/`）：

```bash
# 使用 scp 上传（在本地执行）
scp deploy.sh docker-compose.yml .env.template user@your-server:/tmp/deploy/
```

### 2. 执行部署脚本

```bash
# SSH 连接到服务器
ssh user@your-server

# 进入上传目录
cd /tmp/deploy

# 添加执行权限
chmod +x deploy.sh

# 执行部署（需要 sudo 权限）
sudo ./deploy.sh
```

### 3. 获取连接凭据

部署完成后，凭据信息会保存在 `/opt/data-acquisition/credentials.txt`：

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

### 项目目录结构

```
/opt/data-acquisition/
├── docker-compose.yml      # Docker 编排文件
├── .env                    # 环境变量（包含密码）
├── credentials.txt         # 凭据信息（部署后应删除）
├── data/                   # 数据持久化目录
│   ├── mysql/             # MySQL 数据文件
│   ├── redis/             # Redis 数据文件
│   └── minio/             # MinIO 数据文件
└── config/                # 配置文件（可选）
    ├── mysql/
    └── redis/
```

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

## 防火墙配置

如果使用 `ufw` 防火墙，部署脚本会自动配置。手动配置如下：

```bash
# 开放端口
sudo ufw allow 3306/tcp  # MySQL
sudo ufw allow 6379/tcp  # Redis
sudo ufw allow 9000/tcp  # MinIO API
sudo ufw allow 9001/tcp  # MinIO Console

# 查看状态
sudo ufw status
```

## 生产环境建议

1. **修改默认密码**: 部署后立即修改所有默认密码
2. **限制访问**: 配置防火墙只允许特定 IP 访问
3. **备份策略**: 定期备份 `/opt/data-acquisition/data/` 目录
4. **监控告警**: 配置容器健康检查和告警
5. **SSL/TLS**: 生产环境建议启用 HTTPS

## 备份与恢复

### 备份

```bash
# 创建备份目录
sudo mkdir -p /opt/backups/data-acquisition

# 备份数据目录
sudo tar -czf /opt/backups/data-acquisition/data-$(date +%Y%m%d).tar.gz -C /opt/data-acquisition data

# 备份环境配置
sudo cp /opt/data-acquisition/.env /opt/backups/data-acquisition/.env-$(date +%Y%m%d)
```

### 恢复

```bash
# 停止服务
cd /opt/data-acquisition
docker compose down

# 恢复数据
sudo tar -xzf /opt/backups/data-acquisition/data-20250120.tar.gz -C /opt/data-acquisition

# 启动服务
docker compose up -d
```

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker compose logs -f

# 检查端口占用
sudo netstat -tulpn | grep -E '3306|6379|9000|9001'

# 检查磁盘空间
df -h
```

### 容器反复重启

```bash
# 查看容器详情
docker inspect data-acquisition-mysql

# 检查健康状态
docker compose ps
```

### 密码丢失

重新生成密码：

```bash
cd /opt/data-acquisition

# 停止服务
docker compose down

# 重新生成 .env（使用 deploy.sh 或手动编辑）

# 启动服务
docker compose up -d
```

## 后端配置

将后端 `application-prod.yml` 配置更新为：

```yaml
spring:
  datasource:
    url: jdbc:mysql://your-server-ip:3306/data_acquisition?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: data_acquisition
    password: your_mysql_password
  data:
    redis:
      host: your-server-ip
      port: 6379
      password: your_redis_password

minio:
  endpoint: http://your-server-ip:9000
  accessKey: your_minio_user
  secretKey: your_minio_password
  bucketName: data-acquisition
```

## 卸载

```bash
# 停止并删除容器
cd /opt/data-acquisition
docker compose down

# 删除数据和配置
sudo rm -rf /opt/data-acquisition

# 删除防火墙规则（如已配置）
sudo ufw delete allow 3306/tcp
sudo ufw delete allow 6379/tcp
sudo ufw delete allow 9000/tcp
sudo ufw delete allow 9001/tcp
```

## 支持

如有问题，请检查：
1. Docker 服务是否正常运行
2. 端口是否被占用
3. 防火墙是否正确配置
4. 磁盘空间是否充足
