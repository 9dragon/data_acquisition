#!/bin/bash
##############################################################################
# 手动续期脚本（日常自动续期由 certbot 容器完成，此脚本用于手动干预）
#
# 使用方法:
#   sudo ./renew-cert.sh            # 尝试续期
#   sudo ./renew-cert.sh --force    # 强制续期
#
##############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

print_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cd "$PROJECT_DIR"

FORCE=""
if [ "$1" = "--force" ]; then
    FORCE="--force-renewal"
fi

print_info "尝试续期证书..."

docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm \
    certbot renew $FORCE

print_info "重新加载 Nginx..."

docker compose -f docker-compose.yml -f docker-compose.prod.yml exec frontend \
    nginx -s reload

print_info "完成"
