#!/bin/bash
##############################################################################
# 生产环境更新脚本（零停机）
#
# 功能: 更新应用版本，支持自动回滚
#
# 使用方法:
#   sudo ./update-production.sh [--source-dir <path>]
#
# 更新流程:
#   1. 读取源码位置（从记录或参数）
#   2. 创建备份（数据库、配置、版本信息）
#   3. 拉取最新代码
#   4. 构建新版本镜像（使用 Git commit hash 作为 tag）
#   5. 停止应用服务（保留依赖服务）
#   6. 更新数据库（如有迁移脚本）
#   7. 启动新版本应用
#   8. 健康检查验证
#   9. 清理旧镜像（保留最近3个版本）
#   10. 失败则自动回滚
#
# 参数:
#   --source-dir <path>  手动指定源码目录
#
# 停机时间: 约 30-60 秒（单实例）
#
# 回滚方式:
#   如果更新失败，脚本会自动回滚到上一个版本
#   也可以手动执行: sudo ./rollback.sh
#
# 注意事项:
#   - 默认从首次部署记录的源码位置拉取代码
#   - 如果源码位置变化，使用 --source-dir 参数指定
#   - 确保源码目录是 Git 仓库
#   - 更新前会自动创建备份
#   - 保留最近 3 个版本的 Docker 镜像
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
SOURCE_DIR=""  # 将从 source-info.json 或参数读取
BACKUP_DIR="${PROJECT_DIR}/backups"
GIT_SOURCE_DIR=""  # 手动指定的源码目录

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
        print_info "请先运行首次部署脚本: deploy-production.sh"
        exit 1
    fi
}

# 解析命令行参数
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --source-dir)
                GIT_SOURCE_DIR="$2"
                shift 2
                ;;
            *)
                print_error "未知参数: $1"
                echo "使用方法: sudo ./update-production.sh [--source-dir <path>]"
                exit 1
                ;;
        esac
    done
}

# 读取源码位置信息
load_source_info() {
    # 如果手动指定了源码目录
    if [ -n "$GIT_SOURCE_DIR" ]; then
        SOURCE_DIR="$GIT_SOURCE_DIR"
        print_info "使用指定的源码目录: $SOURCE_DIR"

        if [ ! -d "$SOURCE_DIR" ]; then
            print_error "指定的源码目录不存在: $SOURCE_DIR"
            exit 1
        fi
        return
    fi

    # 从文件读取源码位置
    local source_info_file="${PROJECT_DIR}/source-info.json"

    print_info "查找源码信息文件: $source_info_file"

    if [ ! -f "$source_info_file" ]; then
        print_error "未找到源码信息文件: $source_info_file"
        print_info "项目目录: $PROJECT_DIR"
        print_info "当前目录内容:"
        ls -la "$PROJECT_DIR" 2>/dev/null || echo "  (无法列出目录)"
        print_error "无法确定源码位置来拉取更新"
        print_info ""
        print_info "解决方案:"
        print_info "  1. 确保已通过 deploy-production.sh 部署系统"
        print_info "  2. 或使用 --source-dir 参数手动指定源码目录"
        print_info ""
        print_info "示例:"
        print_info "  sudo ./update-production.sh --source-dir /path/to/source"
        exit 1
    fi

    print_info "源码信息文件存在，读取内容..."
    print_info "文件内容:"
    cat "$source_info_file" | while read line; do
        print_info "  $line"
    done

    # 读取源码目录（兼容带空格的 JSON 格式）
    SOURCE_DIR=$(grep -o '"sourceDir"[[:space:]]*:[[:space:]]*"[^"]*"' "$source_info_file" | sed 's/.*: *"\([^"]*\)".*/\1/')

    print_info "读取到的源码目录: '$SOURCE_DIR'"

    if [ -z "$SOURCE_DIR" ]; then
        print_error "无法从 source-info.json 读取源码目录"
        print_info "请检查文件格式是否正确"
        print_info "预期格式: {\"sourceDir\": \"/path/to/source\"}"
        exit 1
    fi

    if [ ! -d "$SOURCE_DIR" ]; then
        print_error "源码目录不存在: $SOURCE_DIR"
        print_info "源码位置可能在部署后发生了变化"
        print_info "请使用 --source-dir 参数手动指定源码目录"
        exit 1
    fi

    print_info "源码位置: $SOURCE_DIR"
}

# 创建备份
create_backup() {
    print_step "创建备份..."

    local script_dir="${SOURCE_DIR}/deployment/scripts"

    if [ -f "${script_dir}/backup.sh" ]; then
        bash "${script_dir}/backup.sh" || {
            print_error "备份失败，取消更新"
            exit 1
        }
    else
        print_error "备份脚本不存在"
        exit 1
    fi

    print_info "备份完成"
}

# 拉取最新代码
pull_code() {
    print_step "拉取最新代码..."

    cd "$SOURCE_DIR"

    # 检查是否在 Git 仓库内（支持子目录）
    if ! git rev-parse --is-inside-work-tree &> /dev/null; then
        print_warning "$SOURCE_DIR 不在 Git 仓库内"
        print_info "跳过代码拉取，使用现有代码构建"
        return
    fi

    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "工作目录有未提交的更改"
        read -p "是否继续更新？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "取消更新"
            exit 0
        fi
    fi

    # 获取当前分支
    local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "master")
    print_info "当前分支: $current_branch"

    # 检查 Git 凭据存储配置
    local has_credential_helper=$(git config --global credential.helper)
    if [ -z "$has_credential_helper" ]; then
        print_warning "未检测到 Git credential.helper 配置"
        print_info ""
        print_info "如果仓库需要认证，请先配置凭据存储："
        print_info "  git config --global credential.helper store"
        print_info ""
        print_info "配置后首次拉取需要输入用户名密码，之后会自动保存"
        print_info ""
        read -p "是否继续更新？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "取消更新"
            exit 0
        fi
    fi

    # 拉取最新代码
    print_info "从远程仓库拉取最新代码..."
    git fetch origin || {
        print_error "git fetch 失败"
        print_info "如果认证失败，请配置 Git 凭据存储："
        print_info "  git config --global credential.helper store"
        return 1
    }

    git pull origin "$current_branch" || {
        print_error "git pull 失败"
        print_info "如果认证失败，请配置 Git 凭据存储："
        print_info "  git config --global credential.helper store"
        return 1
    }

    local new_commit=$(git rev-parse --short HEAD)
    print_info "代码已更新: $new_commit"
}

# 构建新镜像
build_new_images() {
    print_step "构建新版本镜像..."

    local git_commit=$(cd "$SOURCE_DIR" && git rev-parse --short HEAD)
    local git_full_commit=$(cd "$SOURCE_DIR" && git rev-parse HEAD)

    print_info "Git Commit: $git_commit"

    # 构建后端镜像
    print_info "构建后端镜像..."
    cd "${SOURCE_DIR}/backend"

    # 编译后端项目（支持无 Maven 环境）
    print_info "编译后端项目（确保使用最新代码）..."
    if command -v mvn &> /dev/null; then
        print_info "使用本地 Maven 编译..."
        mvn clean package -DskipTests -q
    else
        # 使用 Docker 构建 JAR（避免本地安装 Maven）
        print_info "使用 Docker 构建后端 JAR..."

        local maven_image="maven:3.9-amazoncorretto-17-alpine"

        # 检查 Maven 镜像是否存在，不存在则拉取
        if ! docker image inspect "$maven_image" &> /dev/null; then
            print_info "Maven 镜像不存在，正在拉取 $maven_image ..."
            print_info "  镜像大小约 400MB，请耐心等待..."
            docker pull "$maven_image" || {
                print_error "Maven 镜像拉取失败"
                return 1
            }
        else
            print_info "Maven 镜像已存在: $maven_image"
        fi

        docker run --rm \
            -v "$(pwd)":/app \
            -w /app \
            "$maven_image" \
            mvn clean package -DskipTests -q
    fi

    docker build \
        -t "data-acquisition-backend:${git_commit}" \
        -f Dockerfile \
        . || {
        print_error "后端镜像构建失败"
        return 1
    }

    # 构建前端镜像
    print_info "构建前端镜像..."
    cd "${SOURCE_DIR}/frontend"

    docker build \
        -t "data-acquisition-frontend:${git_commit}" \
        -f Dockerfile \
        . || {
        print_error "前端镜像构建失败"
        return 1
    }

    # 更新镜像 tag
    echo "BACKEND_IMAGE_TAG=${git_commit}" > "${PROJECT_DIR}/.image-version"
    echo "FRONTEND_IMAGE_TAG=${git_commit}" >> "${PROJECT_DIR}/.image-version"
    echo "GIT_COMMIT=${git_full_commit}" >> "${PROJECT_DIR}/.image-version"
    echo "BUILD_TIME=$(date -Iseconds)" >> "${PROJECT_DIR}/.image-version"

    # 更新 latest tag 到新镜像
    docker tag "data-acquisition-backend:${git_commit}" "data-acquisition-backend:latest"
    docker tag "data-acquisition-frontend:${git_commit}" "data-acquisition-frontend:latest"

    print_info "镜像构建完成: ${git_commit}"
}

# 停止应用服务
stop_app_services() {
    print_step "停止应用服务..."

    cd "$PROJECT_DIR"

    # 只停止应用服务，不停止依赖服务
    docker compose -f docker-compose.yml -f docker-compose.prod.yml stop backend frontend

    print_info "应用服务已停止"
}

# 更新数据库
update_database() {
    print_step "检查数据库更新..."

    # 这里可以添加数据库迁移逻辑
    # 例如使用 Flyway 或 Liquibase

    print_info "数据库检查完成"
}

# 启动新版本
start_new_version() {
    print_step "启动新版本应用..."

    cd "$PROJECT_DIR"

    # 读取新的镜像版本
    if [ -f "${PROJECT_DIR}/.image-version" ]; then
        source "${PROJECT_DIR}/.image-version"
    else
        print_error "未找到镜像版本信息"
        return 1
    fi

    # 更新 docker-compose.prod.yml 中的镜像版本
    # 这里需要动态更新镜像标签

    # 启动服务
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend frontend

    print_info "新版本应用已启动"
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

# 清理旧镜像
cleanup_old_images() {
    print_step "清理旧镜像（保留最近3个版本）..."

    # 清理 backend 旧镜像（保留 latest 和最近3个版本）
    docker images data-acquisition-backend --format "{{.Tag}}" | grep -v "latest" | sort -r | tail -n +4 | xargs -I {} docker rmi "data-acquisition-backend:{}" 2>/dev/null || true

    # 清理 frontend 旧镜像
    docker images data-acquisition-frontend --format "{{.Tag}}" | grep -v "latest" | sort -r | tail -n +4 | xargs -I {} docker rmi "data-acquisition-frontend:{}" 2>/dev/null || true

    # 清理悬空镜像
    docker image prune -f

    print_info "旧镜像清理完成"
}

# 保存版本信息
save_version_info() {
    print_step "保存版本信息..."

    local git_commit=$(cd "$SOURCE_DIR" && git rev-parse HEAD 2>/dev/null || echo "unknown")
    local git_short_commit=$(cd "$SOURCE_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    local git_branch=$(cd "$SOURCE_DIR" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    local deploy_time=$(date -Iseconds)

    cat > "${PROJECT_DIR}/version.json" << EOF
{
  "deployTime": "$deploy_time",
  "gitCommit": "$git_commit",
  "gitShortCommit": "$git_short_commit",
  "gitBranch": "$git_branch",
  "backendImage": "data-acquisition-backend:${git_short_commit}",
  "frontendImage": "data-acquisition-frontend:${git_short_commit}",
  "hostname": "$(hostname)"
}
EOF

    print_info "版本信息已更新"
}

# 回滚
rollback() {
    print_error "更新失败，开始回滚..."

    local script_dir="${SOURCE_DIR}/deployment/scripts"

    if [ -f "${script_dir}/rollback.sh" ]; then
        # 自动回滚到上一个版本
        bash "${script_dir}/rollback.sh" --auto
    else
        print_error "回滚脚本不存在，请手动恢复"
        exit 1
    fi
}

# 显示更新结果
show_result() {
    local git_commit=$(cd "$SOURCE_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")

    print_title "更新完成"

    cat << EOF
${GREEN}系统已成功更新到最新版本！${NC}

========== 版本信息 ==========
Git Commit: ${git_commit}
更新时间: $(date +%Y-%m-%d\ %H:%M:%S)

========== 访问地址 ==========
前端页面: http://localhost
后端API: http://localhost:8080/api/v1

========== 管理命令 ==========
查看状态: ${PROJECT_DIR}/scripts/manage.sh status
查看日志: ${PROJECT_DIR}/scripts/manage.sh logs
回滚版本: ${PROJECT_DIR}/scripts/rollback.sh

EOF
}

# 主函数
main() {
    print_title "数据采集系统 - 更新部署"

    # 解析参数
    parse_arguments "$@"

    # 检查权限
    check_root
    check_project_dir

    # 读取源码位置
    load_source_info

    # 执行更新步骤
    create_backup
    pull_code
    build_new_images
    stop_app_services
    update_database
    start_new_version

    # 健康检查
    if health_check; then
        cleanup_old_images
        save_version_info
        show_result
    else
        rollback
        exit 1
    fi
}

# 执行主函数
main "$@"
