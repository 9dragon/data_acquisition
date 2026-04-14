#!/bin/bash
##############################################################################
# 健康检查脚本
#
# 功能: 检查所有服务的健康状态
#
# 使用方法:
#   ./health-check.sh
#
# 检查项目:
#   - Docker 服务状态
#   - MySQL 数据库连接
#   - Redis 缓存连接
#   - MinIO 存储服务
#   - 后端 API 服务
#   - 前端 Web 服务
#
# 返回值:
#   0 = 所有服务健康
#   1 = 有服务异常
#
# 环境变量:
#   自动从以下位置查找 .env:
#   - $(dirname "$0")/../.env
#   - /opt/data-acquisition/.env
#   - $(dirname "$0")/../../.env
#
# 使用场景:
#   - 部署后验证服务状态
#   - 定时健康监控
#   - 故障排查
#   - CI/CD 流程中的健康检查
#
# 示例:
#   # 独立运行
#   ./health-check.sh
#
#   # 在脚本中使用
#   if ./health-check.sh; then
#       echo "服务正常"
#   fi
#
##############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目名称
PROJECT_NAME="data-acquisition"

# 检查结果
ALL_HEALTHY=true

# 打印带颜色的状态
print_status() {
    local service=$1
    local status=$2
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}[OK]${NC} $service"
    else
        echo -e "${RED}[FAIL]${NC} $service"
        ALL_HEALTHY=false
    fi
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# 检查 Docker 服务
check_docker() {
    if docker ps >/dev/null 2>&1; then
        print_status "Docker 服务" "OK"
        return 0
    else
        print_status "Docker 服务" "FAIL"
        return 1
    fi
}

# 检查容器状态
check_container() {
    local container=$1
    local container_name="${PROJECT_NAME}-${container}"

    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        print_status "$container 容器运行" "OK"
        return 0
    else
        print_status "$container 容器运行" "FAIL"
        return 1
    fi
}

# 检查 MySQL
check_mysql() {
    local container_name="${PROJECT_NAME}-mysql"

    if ! check_container "mysql"; then
        return 1
    fi

    if docker exec "$container_name" mysqladmin ping -h localhost -uroot -p"${MYSQL_ROOT_PASSWORD}" >/dev/null 2>&1; then
        print_status "MySQL 数据库连接" "OK"
        return 0
    else
        print_status "MySQL 数据库连接" "FAIL"
        return 1
    fi
}

# 检查 Redis
check_redis() {
    local container_name="${PROJECT_NAME}-redis"

    if ! check_container "redis"; then
        return 1
    fi

    if docker exec "$container_name" redis-cli -a "${REDIS_PASSWORD}" ping >/dev/null 2>&1 | grep -q "PONG"; then
        print_status "Redis 缓存连接" "OK"
        return 0
    else
        print_status "Redis 缓存连接" "FAIL"
        return 1
    fi
}

# 检查 MinIO
check_minio() {
    local container_name="${PROJECT_NAME}-minio"

    if ! check_container "minio"; then
        return 1
    fi

    if docker exec "$container_name" curl -f http://localhost:9000/minio/health/live >/dev/null 2>&1; then
        print_status "MinIO 存储服务" "OK"
        return 0
    else
        print_status "MinIO 存储服务" "FAIL"
        return 1
    fi
}

# 检查后端服务
check_backend() {
    local container_name="${PROJECT_NAME}-backend"

    if ! check_container "backend"; then
        return 1
    fi

    # 检查容器内部健康
    if docker exec "$container_name" curl -f http://localhost:8080/api/v1/actuator/health >/dev/null 2>&1; then
        print_status "后端 API 服务" "OK"
        return 0
    else
        print_status "后端 API 服务" "FAIL"
        return 1
    fi
}

# 检查前端服务
check_frontend() {
    local container_name="${PROJECT_NAME}-frontend"

    if ! check_container "frontend"; then
        return 1
    fi

    if docker exec "$container_name" curl -f http://localhost/ >/dev/null 2>&1; then
        print_status "前端 Web 服务" "OK"
        return 0
    else
        print_status "前端 Web 服务" "FAIL"
        return 1
    fi
}

# 检查端口占用
check_ports() {
    local ports=("80" "443" "8080" "3306" "6379" "9000")
    local port_occupied=false

    for port in "${ports[@]}"; do
        if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
            print_info "端口 $port 已被占用"
            port_occupied=true
        fi
    done

    if [ "$port_occupied" = false ]; then
        print_status "端口检查" "OK"
    fi
}

# 主函数
main() {
    echo "========================================"
    echo "   数据采集系统 - 健康检查"
    echo "========================================"
    echo ""

    # 加载环境变量（支持多路径查找）
    ENV_FILE=""
    if [ -f "$(dirname "$0")/../.env" ]; then
        ENV_FILE="$(dirname "$0")/../.env"
    elif [ -f "/opt/data-acquisition/.env" ]; then
        ENV_FILE="/opt/data-acquisition/.env"
    elif [ -f "$(dirname "$0")/../../.env" ]; then
        ENV_FILE="$(dirname "$0")/../../.env"
    fi

    if [ -z "$ENV_FILE" ]; then
        echo -e "${RED}错误: 未找到 .env 文件${NC}"
        echo -e "${YELLOW}已尝试的路径:${NC}"
        echo "  - $(dirname "$0")/../.env"
        echo "  - /opt/data-acquisition/.env"
        echo "  - $(dirname "$0")/../../.env"
        exit 1
    fi

    export $(grep -v '^#' "$ENV_FILE" | xargs)

    # 执行检查
    check_docker
    echo ""

    echo "--- 基础服务检查 ---"
    check_mysql
    check_redis
    check_minio
    echo ""

    echo "--- 应用服务检查 ---"
    check_backend
    check_frontend
    echo ""

    # 检查结果
    echo "========================================"
    if [ "$ALL_HEALTHY" = true ]; then
        echo -e "${GREEN}所有服务运行正常${NC}"
        echo "========================================"
        exit 0
    else
        echo -e "${RED}部分服务异常，请检查日志${NC}"
        echo "========================================"
        exit 1
    fi
}

# 执行主函数
main "$@"
