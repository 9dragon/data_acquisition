#!/bin/bash
##############################################################################
# Let's Encrypt 证书初始化脚本
#
# 功能: 首次获取 SSL 证书（解决 Nginx 需要 cert 先启动的鸡生蛋问题）
#
# 使用方法:
#   sudo bash init-letsencrypt.sh
#   sudo bash init-letsencrypt.sh --project-dir /opt/data-acquisition
#
# 前提条件:
#   1. 域名 DNS 已指向本服务器 IP
#   2. 服务器 80 和 443 端口可从外网访问
#   3. docker-compose.prod.yml 已配置 certbot 服务
#   4. .env.production 已配置（含 CERTBOT_EMAIL）
#
##############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置
DOMAIN=${DOMAIN:-pm.anosi.cn}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

print_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }

# 解析参数
PROJECT_DIR=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --project-dir)
            PROJECT_DIR="$2"
            shift 2
            ;;
        *)
            print_error "未知参数: $1"
            echo "使用方法: sudo bash init-letsencrypt.sh [--project-dir <path>]"
            exit 1
            ;;
    esac
done

# 自动检测项目目录
if [ -z "$PROJECT_DIR" ]; then
    # 按优先级检测：标准部署目录 > 脚本上级目录
    if [ -d "/opt/data-acquisition" ] && [ -f "/opt/data-acquisition/docker-compose.prod.yml" ]; then
        PROJECT_DIR="/opt/data-acquisition"
    elif [ -f "${SCRIPT_DIR}/../docker-compose.prod.yml" ]; then
        PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
    else
        print_error "无法自动检测部署目录"
        print_info "请使用 --project-dir 参数指定，例如:"
        print_info "  sudo bash init-letsencrypt.sh --project-dir /opt/data-acquisition"
        exit 1
    fi
fi

print_info "部署目录: $PROJECT_DIR"

# 检查关键文件
if [ ! -f "${PROJECT_DIR}/docker-compose.prod.yml" ]; then
    print_error "未找到 docker-compose.prod.yml: ${PROJECT_DIR}/docker-compose.prod.yml"
    exit 1
fi

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    print_error "请使用 sudo 运行此脚本"
    exit 1
fi

cd "$PROJECT_DIR"

# 读取环境变量
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
elif [ -f .env ]; then
    set -a
    source .env
    set +a
else
    print_warn "未找到 .env.production 或 .env 文件"
fi

DOMAIN=${DOMAIN:-pm.anosi.cn}
CERTBOT_EMAIL=${CERTBOT_EMAIL:-}

print_info "域名: $DOMAIN"

# 检查是否已存在有效证书
if [ -d "certbot/conf/live/${DOMAIN}" ] && [ -f "certbot/conf/live/${DOMAIN}/fullchain.pem" ]; then
    ISSUER=$(openssl x509 -in "certbot/conf/live/${DOMAIN}/fullchain.pem" -noout -issuer 2>/dev/null || true)
    if echo "$ISSUER" | grep -q "Let's Encrypt"; then
        print_info "已存在 Let's Encrypt 证书，跳过获取"
        print_info "如需重新获取，请先删除 certbot/conf/live/${DOMAIN} 目录"
        exit 0
    fi
    print_warn "检测到已有证书文件（非 Let's Encrypt），将尝试重新获取"
fi

# 获取邮箱
if [ -z "$CERTBOT_EMAIL" ]; then
    read -p "请输入用于 Let's Encrypt 的邮箱地址（接收证书过期提醒）: " CERTBOT_EMAIL
    if [ -z "$CERTBOT_EMAIL" ]; then
        print_error "邮箱地址不能为空"
        exit 1
    fi
fi

print_info "邮箱: $CERTBOT_EMAIL"
echo ""

# 创建必要目录
mkdir -p "certbot/conf/live/${DOMAIN}"
mkdir -p "certbot/var"
mkdir -p "certbot/www"

# 步骤 1: 创建自签名备用证书
print_info "步骤 1/4: 创建自签名备用证书..."

openssl req -x509 -nodes -newkey rsa:2048 \
    -days 1 \
    -keyout "certbot/conf/live/${DOMAIN}/privkey.pem" \
    -out "certbot/conf/live/${DOMAIN}/fullchain.pem" \
    -subj "/CN=${DOMAIN}" \
    2>/dev/null

print_info "自签名备用证书已创建"

# 步骤 2: 启动 Nginx
print_info "步骤 2/4: 启动 Nginx..."

# 先构建 certbot 镜像（需要包含 docker CLI）
docker compose -f docker-compose.yml -f docker-compose.prod.yml build certbot 2>/dev/null || true

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate frontend

# 等待 Nginx 启动
RETRIES=0
MAX_RETRIES=30
while [ $RETRIES -lt $MAX_RETRIES ]; do
    if docker ps --format '{{.Names}}' | grep -q "data-acquisition-frontend"; then
        if docker exec data-acquisition-frontend curl -sf http://localhost/ > /dev/null 2>&1; then
            break
        fi
    fi
    RETRIES=$((RETRIES + 1))
    sleep 2
done

if [ $RETRIES -eq $MAX_RETRIES ]; then
    print_error "Nginx 容器启动失败"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail 50 frontend
    exit 1
fi

print_info "Nginx 已启动"

# 步骤 3: 获取真正的 Let's Encrypt 证书
print_info "步骤 3/4: 获取 Let's Encrypt 证书..."

docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm --entrypoint certbot \
    certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "${CERTBOT_EMAIL}" \
    --agree-tos \
    --no-eff-email \
    -d "${DOMAIN}" \
    --non-interactive

if [ $? -ne 0 ]; then
    print_error "证书获取失败"
    print_info "请检查:"
    print_info "  1. 域名 ${DOMAIN} 的 DNS 是否已指向本服务器"
    print_info "  2. 服务器 80 端口是否可从外网访问"
    print_info "  3. 防火墙是否允许 80 端口入站"
    exit 1
fi

print_info "Let's Encrypt 证书获取成功"

# 步骤 4: 重新加载 Nginx 使用新证书
print_info "步骤 4/4: 重新加载 Nginx..."

docker compose -f docker-compose.yml -f docker-compose.prod.yml exec frontend \
    nginx -s reload

print_info "Nginx 已重新加载"

# 启动 certbot 容器（自动续期）
print_info "启动 certbot 自动续期服务..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d certbot

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SSL 证书配置完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  域名: ${DOMAIN}"
echo -e "  HTTPS: https://${DOMAIN}"
echo -e "  证书自动续期已启用"
echo ""
echo -e "  证书文件位于: certbot/conf/live/${DOMAIN}/"
echo -e "  续期频率: 每 12 小时检查一次（证书到期前 30 天自动续期）"
echo ""
