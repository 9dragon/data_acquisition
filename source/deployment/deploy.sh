#!/bin/bash

################################################################################
# 数据采集系统 - 依赖组件一键部署脚本
# 适用于: Ubuntu 22.04
# 部署组件: MySQL 8.0, Redis 7, MinIO
################################################################################

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="/opt/data-acquisition"
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  数据采集系统 - 依赖组件部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

################################################################################
# 1. 系统检查
################################################################################
echo -e "${YELLOW}[1/6] 检查系统环境...${NC}"

# 检查是否为Ubuntu
if [ ! -f /etc/os-release ]; then
    echo -e "${RED}错误: 无法检测操作系统版本${NC}"
    exit 1
fi

source /etc/os-release
if [[ "$ID" != "ubuntu" ]]; then
    echo -e "${YELLOW}警告: 此脚本专为Ubuntu设计，当前系统为 $ID${NC}"
fi

echo -e "  操作系统: $PRETTY_NAME"
echo -e "  内核版本: $(uname -r)"
echo ""

################################################################################
# 2. 安装Docker和Docker Compose
################################################################################
echo -e "${YELLOW}[2/6] 检查并安装Docker...${NC}"

if ! command -v docker &> /dev/null; then
    echo "  Docker未安装，开始安装..."

    # 更新包索引
    apt-get update -y

    # 安装依赖
    apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    # 添加Docker GPG密钥
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    # 添加Docker仓库
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # 安装Docker
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    echo -e "${GREEN}  Docker安装完成${NC}"
else
    echo -e "  ${GREEN}Docker已安装: $(docker --version)${NC}"
fi

# 启动Docker服务
systemctl start docker
systemctl enable docker

# 配置Docker镜像加速器（国内环境）
echo ""
echo -e "${YELLOW}[2/6] 配置Docker镜像加速器...${NC}"
mkdir -p /etc/docker

# 配置多个国内镜像源
cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me",
    "https://docker.m.daocloud.io",
    "https://dockerproxy.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://docker.nju.edu.cn"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# 重启Docker使配置生效
systemctl daemon-reload
systemctl restart docker

echo -e "${GREEN}  镜像加速器配置完成${NC}"
echo ""

# 安装docker-compose standalone作为备用（如果插件版本不可用）
if ! docker compose version &> /dev/null && ! docker-compose --version &> /dev/null; then
    echo "  安装docker-compose standalone..."
    curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Docker Compose命令检测（兼容新旧版本）
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
    echo -e "  ${GREEN}使用: docker compose (插件版本)${NC}"
elif docker-compose --version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
    echo -e "  ${GREEN}使用: docker-compose (独立版本)${NC}"
else
    echo -e "${RED}错误: Docker Compose未正确安装${NC}"
    exit 1
fi

echo ""

################################################################################
# 3. 创建项目目录
################################################################################
echo -e "${YELLOW}[3/6] 创建项目目录...${NC}"

mkdir -p "$PROJECT_DIR/data/mysql"
mkdir -p "$PROJECT_DIR/data/redis"
mkdir -p "$PROJECT_DIR/data/minio"

echo -e "  项目目录: $PROJECT_DIR"
echo ""

################################################################################
# 4. 生成配置文件
################################################################################
echo -e "${YELLOW}[4/6] 生成配置文件...${NC}"

# 生成随机密码
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16 | tr -d '=+/' | cut -c1-16)
MYSQL_PASSWORD=$(openssl rand -base64 16 | tr -d '=+/' | cut -c1-16)
REDIS_PASSWORD=$(openssl rand -base64 16 | tr -d '=+/' | cut -c1-16)
MINIO_ROOT_USER=$(openssl rand -base64 12 | tr -d '=+/' | cut -c1-12)
MINIO_ROOT_PASSWORD=$(openssl rand -base64 16 | tr -d '=+/' | cut -c1-16)

# 生成.env文件
cat > "$PROJECT_DIR/.env" << EOF
# MySQL配置
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=data_acquisition
MYSQL_USER=data_acquisition
MYSQL_PASSWORD=${MYSQL_PASSWORD}

# Redis配置
REDIS_PASSWORD=${REDIS_PASSWORD}

# MinIO配置
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
MINIO_DEFAULT_BUCKETS=data-acquisition
EOF

# 生成credentials.txt
cat > "$PROJECT_DIR/credentials.txt" << EOF
################################################################################
# 数据采集系统 - 连接凭据
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
################################################################################

==================== MySQL 连接信息 ====================
Host: $(hostname -I | awk '{print $1}'):3306
Database: data_acquisition
Root Password: ${MYSQL_ROOT_PASSWORD}
User: data_acquisition
Password: ${MYSQL_PASSWORD}

命令行连接:
mysql -h $(hostname -I | awk '{print $1}') -u root -p${MYSQL_ROOT_PASSWORD}

==================== Redis 连接信息 ====================
Host: $(hostname -I | awk '{print $1}'):6379
Password: ${REDIS_PASSWORD}

命令行连接:
docker exec -it data-acquisition-redis redis-cli -a ${REDIS_PASSWORD}

==================== MinIO 连接信息 ====================
API Endpoint: http://$(hostname -I | awk '{print $1}'):9000
Console: http://$(hostname -I | awk '{print $1}'):9001
Access Key: ${MINIO_ROOT_USER}
Secret Key: ${MINIO_ROOT_PASSWORD}
Default Bucket: data-acquisition

==================== 注意事项 ====================
1. 请妥善保管此文件，包含敏感信息
2. 建议将此文件下载后删除服务器上的副本
3. 生产环境请及时修改默认密码
EOF

chmod 600 "$PROJECT_DIR/credentials.txt"

echo -e "  ${GREEN}.env文件已生成${NC}"
echo -e "  ${GREEN}credentials.txt已生成${NC}"
echo ""

################################################################################
# 5. 部署服务
################################################################################
echo -e "${YELLOW}[5/6] 部署Docker服务...${NC}"

# 复制docker-compose.yml到项目目录
cp "$DEPLOY_DIR/docker-compose.yml" "$PROJECT_DIR/"

cd "$PROJECT_DIR"

# 并行拉取所有镜像
echo ""
echo -e "${YELLOW}  检查Docker镜像...${NC}"

# 定义镜像列表
IMAGES=(
    "mysql:8.0"
    "redis:7-alpine"
    "minio/minio:latest"
)

# 检查镜像是否存在，不存在则并行拉取
PIDS=()
NEED_PULL=0

for image in "${IMAGES[@]}"; do
    if docker image inspect "$image" &> /dev/null; then
        echo "  ${GREEN}✓${NC} ${image} - 已存在"
    else
        echo "  ${YELLOW}↓${NC} ${image} - 需要拉取"
        NEED_PULL=1
        docker pull "$image" > /tmp/pull_$$.log 2>&1 &
        PIDS+=($!)
    fi
done

# 等待所有拉取完成
if [ $NEED_PULL -eq 1 ]; then
    echo ""
    echo -e "${YELLOW}  等待镜像拉取完成...${NC}"
    FAILED=0
    for i in "${!PIDS[@]}"; do
        pid=${PIDS[$i]}
        if wait $pid; then
            # 查找对应的镜像（需要跳过已存在的镜像）
            for image in "${IMAGES[@]}"; do
                if ! docker image inspect "$image" &> /dev/null; then
                    echo "  ${GREEN}✓${NC} ${image}"
                    break
                fi
            done
        else
            echo -e "  ${RED}✗${NC} 拉取失败"
            cat /tmp/pull_$$.log
            FAILED=1
        fi
        rm -f /tmp/pull_$$.log
    done

    if [ $FAILED -eq 1 ]; then
        echo -e "${RED}错误: 部分镜像拉取失败${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}  镜像检查完成${NC}"

# 启动服务
echo ""
echo -e "${YELLOW}  启动Docker服务...${NC}"
$DOCKER_COMPOSE up -d

echo ""
echo -e "${GREEN}等待服务启动...${NC}"
sleep 10

################################################################################
# 6. 配置防火墙
################################################################################
echo ""
echo -e "${YELLOW}[6/6] 配置防火墙...${NC}"

if command -v ufw &> /dev/null; then
    echo "  开放必要端口..."
    ufw allow 3306/tcp comment 'MySQL'
    ufw allow 6379/tcp comment 'Redis'
    ufw allow 9000/tcp comment 'MinIO API'
    ufw allow 9001/tcp comment 'MinIO Console'
    echo -e "  ${GREEN}防火墙规则已添加${NC}"
else
    echo -e "  ${YELLOW}ufw未安装，请手动配置防火墙${NC}"
fi

echo ""

################################################################################
# 完成
################################################################################
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 显示容器状态
echo -e "${YELLOW}容器状态:${NC}"
$DOCKER_COMPOSE ps
echo ""

# 显示连接信息
echo -e "${YELLOW}==================== 连接信息 ====================${NC}"
echo ""
echo -e "${GREEN}MySQL:${NC}"
echo -e "  地址: $(hostname -I | awk '{print $1}'):3306"
echo -e "  Root密码: ${MYSQL_ROOT_PASSWORD}"
echo ""
echo -e "${GREEN}Redis:${NC}"
echo -e "  地址: $(hostname -I | awk '{print $1}'):6379"
echo -e "  密码: ${REDIS_PASSWORD}"
echo ""
echo -e "${GREEN}MinIO:${NC}"
echo -e "  API: http://$(hostname -I | awk '{print $1}'):9000"
echo -e "  控制台: http://$(hostname -I | awk '{print $1}'):9001"
echo -e "  用户: ${MINIO_ROOT_USER}"
echo -e "  密码: ${MINIO_ROOT_PASSWORD}"
echo ""

echo -e "${YELLOW}==================== 管理命令 ====================${NC}"
echo -e "查看状态: ${GREEN}cd $PROJECT_DIR && $DOCKER_COMPOSE ps${NC}"
echo -e "查看日志: ${GREEN}cd $PROJECT_DIR && $DOCKER_COMPOSE logs -f${NC}"
echo -e "停止服务: ${GREEN}cd $PROJECT_DIR && $DOCKER_COMPOSE down${NC}"
echo -e "重启服务: ${GREEN}cd $PROJECT_DIR && $DOCKER_COMPOSE restart${NC}"
echo ""

echo -e "${YELLOW}==================== 凭据文件 ====================${NC}"
echo -e "完整连接信息已保存到: ${GREEN}$PROJECT_DIR/credentials.txt${NC}"
echo -e "${RED}请尽快下载并删除服务器上的凭据文件!${NC}"
echo ""

################################################################################
# 验证服务
################################################################################
echo -e "${YELLOW}==================== 服务验证 ====================${NC}"

# 验证MySQL
if docker exec data-acquisition-mysql mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}" &> /dev/null; then
    echo -e "  MySQL: ${GREEN}运行正常${NC}"
else
    echo -e "  MySQL: ${RED}启动中或异常${NC}"
fi

# 验证Redis
if docker exec data-acquisition-redis redis-cli -a "${REDIS_PASSWORD}" ping | grep -q "PONG"; then
    echo -e "  Redis: ${GREEN}运行正常${NC}"
else
    echo -e "  Redis: ${RED}启动中或异常${NC}"
fi

# 验证MinIO
if curl -s http://localhost:9000/minio/health/live > /dev/null; then
    echo -e "  MinIO: ${GREEN}运行正常${NC}"
else
    echo -e "  MinIO: ${RED}启动中或异常${NC}"
fi

echo ""
echo -e "${GREEN}部署脚本执行完成!${NC}"
