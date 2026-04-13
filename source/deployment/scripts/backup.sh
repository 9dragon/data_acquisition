#!/bin/bash
##############################################################################
# 备份脚本
#
# 功能: 备份数据库、配置和版本信息
#
# 使用方法:
#   sudo ./backup.sh
#
# 备份内容:
#   - MySQL 数据库 (完整 SQL 导出)
#   - MinIO 对象存储数据
#   - 环境配置文件 (.env.production)
#   - 版本信息 (version.json)
#   - Docker Compose 配置
#
# 备份位置:
#   /opt/data-acquisition/backups/
#
# 文件命名:
#   backup-YYYYMMDD-HHMMSS.tar.gz
#
# 保留策略:
#   自动删除 7 天前的备份
#
# 还原方式:
#   sudo ./rollback.sh
#   然后选择要恢复的备份版本
#
# 注意事项:
#   - 需要 sudo 权限执行
#   - 确保 MySQL/MinIO 服务正在运行
#   - 大数据量备份可能需要较长时间
#
##############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 项目配置
PROJECT_NAME="data-acquisition"
PROJECT_DIR="/opt/${PROJECT_NAME}"
BACKUP_DIR="${PROJECT_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="backup-${TIMESTAMP}"

# 打印信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查目录
check_directories() {
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "项目目录不存在: $PROJECT_DIR"
        exit 1
    fi

    mkdir -p "$BACKUP_DIR"
}

# 备份数据库
backup_database() {
    print_info "备份数据库..."

    local mysql_container="${PROJECT_NAME}-mysql"
    local backup_file="${BACKUP_DIR}/${BACKUP_NAME}/database.sql"

    # 读取密码
    if [ -f "${PROJECT_DIR}/.env.production" ]; then
        source "${PROJECT_DIR}/.env.production"
    else
        print_error "未找到 .env.production 文件"
        exit 1
    fi

    # 备份数据库
    docker exec "$mysql_container" mysqldump \
        -u"${MYSQL_USER}" \
        -p"${MYSQL_PASSWORD}" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        "${MYSQL_DATABASE}" > "$backup_file" 2>/dev/null || {
        print_error "数据库备份失败"
        exit 1
    }

    print_info "数据库备份完成: $backup_file"
}

# 备份 MinIO 数据
backup_minio() {
    print_info "备份 MinIO 数据..."

    local minio_container="${PROJECT_NAME}-minio"
    local backup_dir="${BACKUP_DIR}/${BACKUP_NAME}/minio"

    mkdir -p "$backup_dir"

    # 使用 docker cp 备份 MinIO 数据目录
    docker cp "${minio_container}:/data" "$backup_dir/" 2>/dev/null || {
        print_error "MinIO 备份失败"
        return 1
    }

    print_info "MinIO 备份完成"
}

# 备份配置文件
backup_config() {
    print_info "备份配置文件..."

    local config_backup_dir="${BACKUP_DIR}/${BACKUP_NAME}/config"

    mkdir -p "$config_backup_dir"

    # 复制环境变量文件
    if [ -f "${PROJECT_DIR}/.env.production" ]; then
        cp "${PROJECT_DIR}/.env.production" "$config_backup_dir/"
    fi

    # 复制 docker-compose 文件
    if [ -f "${PROJECT_DIR}/docker-compose.yml" ]; then
        cp "${PROJECT_DIR}/docker-compose.yml" "$config_backup_dir/"
    fi

    # 复制版本信息
    if [ -f "${PROJECT_DIR}/version.json" ]; then
        cp "${PROJECT_DIR}/version.json" "$config_backup_dir/"
    fi

    print_info "配置文件备份完成"
}

# 创建版本信息
create_version_info() {
    print_info "创建版本信息..."

    local version_file="${BACKUP_DIR}/${BACKUP_NAME}/backup-info.json"

    cat > "$version_file" <<EOF
{
  "backupTime": "$(date -Iseconds)",
  "timestamp": "$TIMESTAMP",
  "gitCommit": "$(cd "$(dirname "$0")/../.." && git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(cd "$(dirname "$0")/../.." && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "hostname": "$(hostname)",
  "backupName": "$BACKUP_NAME"
}
EOF

    print_info "版本信息已创建"
}

# 压缩备份
compress_backup() {
    print_info "压缩备份文件..."

    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}" >/dev/null 2>&1
    rm -rf "${BACKUP_NAME}"

    print_info "备份已压缩: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
}

# 清理旧备份
cleanup_old_backups() {
    print_info "清理旧备份（保留最近7天）..."

    find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +7 -delete 2>/dev/null || true

    print_info "旧备份清理完成"
}

# 显示备份信息
show_backup_info() {
    local backup_size=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)

    echo ""
    echo "========================================"
    echo -e "${GREEN}备份完成${NC}"
    echo "========================================"
    echo "备份文件: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    echo "备份大小: $backup_size"
    echo "备份时间: $(date)"
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "   数据采集系统 - 备份"
    echo "========================================"
    echo ""

    # 检查是否以 root 运行
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 sudo 运行此脚本"
        exit 1
    fi

    # 检查目录
    check_directories

    # 创建备份目录
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"

    # 执行备份
    backup_database
    backup_minio
    backup_config
    create_version_info
    compress_backup
    cleanup_old_backups

    # 显示备份信息
    show_backup_info
}

# 执行主函数
main "$@"
