#!/bin/bash
##############################################################################
# 回滚脚本
#
# 功能: 将系统回滚到指定版本
#
# 使用方法:
#   交互模式: sudo ./rollback.sh
#   自动回滚: sudo ./rollback.sh --auto
#   列出版本: sudo ./rollback.sh --list
#
# 回滚方式:
#   1) 通过镜像版本回滚
#      - 恢复到指定的 Docker 镜像版本
#      - 适用于代码更新后的回滚
#      - 不包含数据库数据恢复
#
#   2) 通过备份文件回滚
#      - 从完整的备份文件恢复
#      - 包含数据库、配置、版本信息
#      - 适用于数据损坏或错误删除的恢复
#
# 可回滚内容:
#   - 数据库 (从备份恢复)
#   - 应用镜像 (切换到指定版本)
#   - 配置文件 (从备份恢复)
#
# 注意事项:
#   - 回滚会停止当前服务
#   - 建议在回滚前先创建备份
#   - 数据库回滚会覆盖当前数据
#   - 回滚操作会记录到 rollback.log
#
# 自动回滚:
#   --auto 参数会自动回滚到上一个镜像版本
#   主要用于更新失败后的自动恢复
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
BACKUP_DIR="${PROJECT_DIR}/backups"

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

print_step() {
    echo -e "${BLUE}==> $1${NC}"
}

# 打印标题
print_title() {
    echo ""
    echo "========================================"
    echo "   $1"
    echo "========================================"
    echo ""
}

# 检查是否为 root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 sudo 运行此脚本"
        exit 1
    fi
}

# 检查项目目录
check_project_dir() {
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "项目目录不存在: $PROJECT_DIR"
        exit 1
    fi
}

# 列出可用版本
list_versions() {
    print_title "可用版本列表"

    # 显示备份文件
    if [ -d "$BACKUP_DIR" ] && [ -n "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        echo "========== 备份版本 =========="
        local index=1
        for backup in $(ls -t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null); do
            local basename=$(basename "$backup" .tar.gz)
            local info_file="${BACKUP_DIR}/.tmp/${basename}/backup-info.json"

            # 提取备份信息
            if tar -xzf "$backup" -C "${BACKUP_DIR}/.tmp" "${basename}/backup-info.json" 2>/dev/null; then
                local backup_time=$(grep -o '"backupTime":"[^"]*"' "$info_file" | cut -d'"' -f4)
                local git_commit=$(grep -o '"gitCommit":"[^"]*"' "$info_file" | cut -d'"' -f4)
                echo "[$index] $basename"
                echo "    时间: $backup_time"
                echo "    Commit: $git_commit"
                echo ""
                rm -rf "${BACKUP_DIR}/.tmp"
            else
                echo "[$index] $basename"
                echo ""
            fi
            index=$((index + 1))
        done
    else
        print_warning "未找到备份文件"
    fi

    # 显示当前镜像版本
    echo "========== 镜像版本 =========="
    echo "当前后端镜像:"
    docker images data-acquisition-backend --format "  {{.Tag}} ({{.CreatedAt}})"
    echo ""
    echo "当前前端镜像:"
    docker images data-acquisition-frontend --format "  {{.Tag}} ({{.CreatedAt}})"
    echo ""
}

# 通过镜像回滚
rollback_by_image() {
    local backend_tag=$1
    local frontend_tag=$2

    print_step "回滚到镜像版本..."

    # 停止应用服务
    cd "$PROJECT_DIR"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml stop backend frontend

    # 更新镜像版本
    echo "BACKEND_IMAGE_TAG=${backend_tag}" > "${PROJECT_DIR}/.image-version"
    echo "FRONTEND_IMAGE_TAG=${frontend_tag}" >> "${PROJECT_DIR}/.image-version"
    echo "ROLLBACK_TIME=$(date -Iseconds)" >> "${PROJECT_DIR}/.image-version"
    echo "ROLLBACK_FROM=$(cat ${PROJECT_DIR}/version.json | grep -o '"gitShortCommit":"[^"]*"' | cut -d'"' -f4)" >> "${PROJECT_DIR}/.image-version"

    # 启动服务
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend frontend

    print_info "服务已启动，等待健康检查..."
    sleep 5
}

# 通过备份回滚
rollback_by_backup() {
    local backup_file=$1

    print_step "从备份回滚..."

    local temp_dir="${BACKUP_DIR}/.restore"
    mkdir -p "$temp_dir"

    # 解压备份
    print_info "解压备份文件..."
    tar -xzf "$backup_file" -C "$temp_dir"

    local backup_name=$(basename "$backup_file" .tar.gz)

    # 停止应用服务
    cd "$PROJECT_DIR"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml stop backend frontend

    # 恢复数据库
    if [ -f "${temp_dir}/${backup_name}/database.sql" ]; then
        print_info "恢复数据库..."

        # 加载密码
        source "${PROJECT_DIR}/.env"

        docker exec -i data-acquisition-mysql mysql \
            -u"${MYSQL_USER}" \
            -p"${MYSQL_PASSWORD}" \
            "${MYSQL_DATABASE}" < "${temp_dir}/${backup_name}/database.sql"

        print_info "数据库已恢复"
    fi

    # 恢复配置
    if [ -f "${temp_dir}/${backup_name}/config/.env" ]; then
        print_info "恢复配置文件..."
        cp "${temp_dir}/${backup_name}/config/.env" "${PROJECT_DIR}/.env"
    fi

    # 清理临时文件
    rm -rf "$temp_dir"

    # 启动服务
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend frontend

    print_info "服务已启动，等待健康检查..."
    sleep 5
}

# 健康检查
health_check() {
    print_step "健康检查..."

    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker exec data-acquisition-backend curl -f http://localhost:8080/api/v1/actuator/health >/dev/null 2>&1; then
            print_info "后端服务健康检查通过"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    echo ""

    print_error "健康检查失败"
    return 1
}

# 记录回滚操作
log_rollback() {
    local log_file="${PROJECT_DIR}/rollback.log"
    local rollback_time=$(date -Iseconds)
    local from_version=$(cat "${PROJECT_DIR}/version.json" 2>/dev/null | grep -o '"gitShortCommit":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

    echo "[$rollback_time] Rollback from $from_version to $1" >> "$log_file"

    print_info "回滚操作已记录到: $log_file"
}

# 显示回滚结果
show_result() {
    local target_version=$1

    print_title "回滚完成"

    cat << EOF
${GREEN}系统已成功回滚！${NC}

========== 版本信息 ==========
回滚到: $target_version
回滚时间: $(date +%Y-%m-%d\ %H:%M:%S)

========== 访问地址 ==========
前端页面: http://localhost
后端API: http://localhost:8080/api/v1

========== 管理命令 ==========
查看状态: ${PROJECT_DIR}/scripts/manage.sh status
查看日志: ${PROJECT_DIR}/scripts/manage.sh logs
查看版本: ${PROJECT_DIR}/scripts/manage.sh version

EOF
}

# 自动回滚（用于更新失败后）
auto_rollback() {
    print_title "自动回滚"

    # 获取上一个版本
    local previous_backend=$(docker images data-acquisition-backend --format "{{.Tag}}" | grep -v "latest" | head -n 2 | tail -n 1)
    local previous_frontend=$(docker images data-acquisition-frontend --format "{{.Tag}}" | grep -v "latest" | head -n 2 | tail -n 1)

    if [ -z "$previous_backend" ] || [ "$previous_backend" = "<none>" ]; then
        print_error "未找到可回滚的版本"
        exit 1
    fi

    print_info "自动回滚到: $previous_backend"

    rollback_by_image "$previous_backend" "$previous_frontend"

    if health_check; then
        log_rollback "$previous_backend"
        show_result "$previous_backend"
    else
        print_error "回滚失败，请手动检查"
        exit 1
    fi
}

# 交互式回滚
interactive_rollback() {
    print_title "数据采集系统 - 版本回滚"

    list_versions

    echo "请选择回滚方式:"
    echo "  1) 通过镜像版本回滚"
    echo "  2) 通过备份文件回滚"
    echo "  0) 取消"
    echo ""
    read -p "请输入选项 [0-2]: " choice

    case $choice in
        1)
            echo ""
            echo "可用镜像版本:"
            docker images data-acquisition-backend --format "{{.Tag}}"
            echo ""
            read -p "请输入要回滚的版本标签: " version

            if docker images | grep -q "data-acquisition-backend.*${version}"; then
                rollback_by_image "$version" "$version"

                if health_check; then
                    log_rollback "$version"
                    show_result "$version"
                else
                    print_error "回滚后健康检查失败"
                    exit 1
                fi
            else
                print_error "未找到指定的镜像版本"
                exit 1
            fi
            ;;
        2)
            echo ""
            if [ -d "$BACKUP_DIR" ] && [ -n "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
                print_info "可用的备份文件:"
                ls -t "$BACKUP_DIR"/backup-*.tar.gz
                echo ""
                read -p "请输入备份文件名: " backup_name

                if [ -f "${BACKUP_DIR}/${backup_name}" ]; then
                    rollback_by_backup "${BACKUP_DIR}/${backup_name}"

                    if health_check; then
                        log_rollback "$backup_name"
                        show_result "$backup_name"
                    else
                        print_error "回滚后健康检查失败"
                        exit 1
                    fi
                else
                    print_error "备份文件不存在"
                    exit 1
                fi
            else
                print_error "未找到备份文件"
                exit 1
            fi
            ;;
        0)
            print_info "取消回滚"
            exit 0
            ;;
        *)
            print_error "无效的选项"
            exit 1
            ;;
    esac
}

# 显示帮助
show_help() {
    cat << EOF
数据采集系统 - 回滚脚本

用法: $0 [选项]

选项:
  --auto              自动回滚到上一个版本（用于更新失败）
  -l, --list          列出可用版本
  -h, --help          显示此帮助信息

无参数时进入交互式模式

示例:
  $0                  # 交互式回滚
  $0 --auto           # 自动回滚
  $0 --list           # 列出可用版本

EOF
}

# 主函数
main() {
    # 检查权限
    check_root
    check_project_dir

    # 解析参数
    case "${1:-}" in
        --auto)
            auto_rollback
            ;;
        -l|--list)
            list_versions
            ;;
        -h|--help)
            show_help
            ;;
        "")
            interactive_rollback
            ;;
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
