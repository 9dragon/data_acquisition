#!/bin/bash
##############################################################################
# 统一管理脚本
#
# 功能: 启动、停止、重启服务，查看状态和日志
#
# 使用方法:
#   ./manage.sh <命令> [选项]
#
# 可用命令:
#   start               启动所有服务
#   stop                停止所有服务
#   restart             重启所有服务
#   status              查看服务状态
#   logs [service]      查看日志（可指定服务名）
#   health              健康检查
#   backup              执行备份
#   version             查看当前版本信息
#   images              查看 Docker 镜像列表
#   cleanup             清理旧镜像
#   exec <service>      进入容器
#   help                显示此帮助信息
#
# 服务名称:
#   backend             后端 API 服务
#   frontend            前端 Web 服务
#   mysql               MySQL 数据库
#   redis               Redis 缓存
#   minio               MinIO 对象存储
#
# 示例:
#   ./manage.sh start                    # 启动所有服务
#   ./manage.sh logs backend             # 查看后端日志
#   ./manage.sh exec mysql               # 进入 MySQL 容器
#   ./manage.sh health                   # 健康检查
#
# 注意事项:
#   - 部分命令需要 sudo 权限
#   - exec 命令需要 .env.production 文件存在
#   - 日志查看使用 Ctrl+C 退出
#
##############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目配置
PROJECT_NAME="data-acquisition"
PROJECT_DIR="/opt/${PROJECT_NAME}"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"

# 打印信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 检查项目目录
check_project_dir() {
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "项目目录不存在: $PROJECT_DIR"
        echo "请先运行首次部署脚本: deploy-production.sh"
        exit 1
    fi

    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose 文件不存在: $COMPOSE_FILE"
        exit 1
    fi
}

# 启动服务
start_services() {
    print_info "启动所有服务..."

    cd "$PROJECT_DIR"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

    print_info "服务启动完成"
    sleep 3

    # 显示状态
    show_status
}

# 停止服务
stop_services() {
    print_info "停止所有服务..."

    cd "$PROJECT_DIR"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml down

    print_info "服务已停止"
}

# 重启服务
restart_services() {
    print_info "重启所有服务..."

    stop_services
    sleep 2
    start_services
}

# 显示状态
show_status() {
    echo ""
    echo "========================================"
    echo "   服务状态"
    echo "========================================"
    echo ""

    cd "$PROJECT_DIR"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

    echo ""
    echo "========================================"
}

# 查看日志
show_logs() {
    local service=$1

    cd "$PROJECT_DIR"

    if [ -z "$service" ]; then
        print_info "查看所有服务日志（Ctrl+C 退出）..."
        docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
    else
        print_info "查看 $service 服务日志（Ctrl+C 退出）..."
        docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f "$service"
    fi
}

# 健康检查
health_check() {
    local script_dir="$(dirname "$0")"
    bash "${script_dir}/health-check.sh"
}

# 执行备份
do_backup() {
    local script_dir="$(dirname "$0")"
    bash "${script_dir}/backup.sh"
}

# 查看版本信息
show_version() {
    local version_file="${PROJECT_DIR}/version.json"

    if [ -f "$version_file" ]; then
        echo ""
        echo "========================================"
        echo "   当前版本信息"
        echo "========================================"
        cat "$version_file"
        echo "========================================"
        echo ""
    else
        print_warning "未找到版本信息文件"
    fi
}

# 查看镜像列表
show_images() {
    echo ""
    echo "========================================"
    echo "   Docker 镜像列表"
    echo "========================================"
    echo ""
    docker images | grep -E "data-acquisition|REPOSITORY"
    echo ""
}

# 清理旧镜像
cleanup_images() {
    print_info "清理旧镜像（保留最近3个版本）..."

    # 清理 backend 旧镜像
    docker images data-acquisition-backend --format "{{.Tag}}" | sort -r | tail -n +4 | xargs -I {} docker rmi "data-acquisition-backend:{}" 2>/dev/null || true

    # 清理 frontend 旧镜像
    docker images data-acquisition-frontend --format "{{.Tag}}" | sort -r | tail -n +4 | xargs -I {} docker rmi "data-acquisition-frontend:{}" 2>/dev/null || true

    # 清理悬空镜像
    docker image prune -f

    print_info "旧镜像清理完成"
}

# 进入容器
exec_container() {
    local service=$1

    if [ -z "$service" ]; then
        print_error "请指定服务名称（backend/frontend/mysql/redis/minio）"
        exit 1
    fi

    local container_name="${PROJECT_NAME}-${service}"

    if ! docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        print_error "容器 $container_name 未运行"
        exit 1
    fi

    # 加载环境变量（用于 MySQL 和 Redis 连接）
    local env_file="${PROJECT_DIR}/.env.production"
    if [ -f "$env_file" ]; then
        export $(grep -v '^#' "$env_file" | xargs)
    fi

    print_info "进入 $service 容器（exit 退出）..."

    if [ "$service" = "backend" ]; then
        docker exec -it "$container_name" sh
    elif [ "$service" = "frontend" ]; then
        docker exec -it "$container_name" sh
    elif [ "$service" = "mysql" ]; then
        if [ -z "${MYSQL_USER}" ] || [ -z "${MYSQL_PASSWORD}" ] || [ -z "${MYSQL_DATABASE}" ]; then
            print_error "数据库环境变量未加载，请检查 .env.production 文件"
            exit 1
        fi
        docker exec -it "$container_name" mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}"
    elif [ "$service" = "redis" ]; then
        if [ -z "${REDIS_PASSWORD}" ]; then
            print_error "Redis 密码环境变量未加载，请检查 .env.production 文件"
            exit 1
        fi
        docker exec -it "$container_name" redis-cli -a "${REDIS_PASSWORD}"
    else
        docker exec -it "$container_name" sh
    fi
}

# 显示帮助
show_help() {
    cat << EOF
数据采集系统 - 管理脚本

用法: $0 <命令> [选项]

命令:
  start               启动所有服务
  stop                停止所有服务
  restart             重启所有服务
  status              查看服务状态
  logs [service]      查看日志（可指定服务名: backend, frontend, mysql, redis, minio）
  health              健康检查
  backup              执行备份
  version             查看当前版本信息
  images              查看 Docker 镜像列表
  cleanup             清理旧镜像
  exec <service>      进入容器（backend/frontend/mysql/redis/minio）
  help                显示此帮助信息

示例:
  $0 start                    # 启动所有服务
  $0 logs backend             # 查看后端日志
  $0 exec mysql               # 进入 MySQL 容器
  $0 health                   # 健康检查

EOF
}

# 主函数
main() {
    local command=$1
    shift || true

    case "$command" in
        start)
            check_project_dir
            start_services
            ;;
        stop)
            check_project_dir
            stop_services
            ;;
        restart)
            check_project_dir
            restart_services
            ;;
        status)
            check_project_dir
            show_status
            ;;
        logs)
            check_project_dir
            show_logs "$1"
            ;;
        health)
            check_project_dir
            health_check
            ;;
        backup)
            check_project_dir
            do_backup
            ;;
        version)
            check_project_dir
            show_version
            ;;
        images)
            show_images
            ;;
        cleanup)
            cleanup_images
            ;;
        exec)
            check_project_dir
            exec_container "$1"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
