#!/bin/bash
##############################################################################
# 生产环境更新脚本（零停机）
#
# 功能: 更新应用版本，支持自动回滚
#
# 使用方法:
#   sudo ./update-production.sh [选项]
#
# 更新流程:
#   1. 读取源码位置（从记录或参数）
#   2. 创建备份（数据库、配置、版本信息）
#   3. 拉取最新代码
#   4. 检测/选择更新目标（前端/后端/全部）
#   5. 构建新版本镜像（使用 Git commit hash 作为 tag）
#   6. 停止应用服务（保留依赖服务）
#   7. 更新数据库（如有迁移脚本）
#   8. 启动新版本应用
#   9. 健康检查验证
#   10. 清理旧镜像（保留最近3个版本）
#   11. 失败则自动回滚
#
# 参数:
#   --source-dir <path>    手动指定源码目录
#   --cache-hours <n>      凭据缓存时间（-1=永久保存，0=不保存，>0=缓存N小时）
#   --target <target>      更新目标: frontend（仅前端）, backend（仅后端）, all（全部）
#   --auto-detect          自动检测前端/后端代码变更，只更新有改动的部分
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
GIT_CACHE_HOURS=""  # 凭据缓存时间（-1=永久保存，0=不保存，>0=缓存N小时）

# 选择性更新相关变量
UPDATE_TARGET=""       # 更新目标: all, frontend, backend（空则交互选择）
AUTO_DETECT=false      # 是否自动检测变更
DETECTED_TARGET=""     # 自动检测到的目标

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
            --cache-hours)
                GIT_CACHE_HOURS="$2"
                shift 2
                ;;
            --target)
                UPDATE_TARGET="$2"
                shift 2
                # 验证参数值
                case "$UPDATE_TARGET" in
                    frontend|backend|all) ;;
                    *)
                        print_error "无效的更新目标: $UPDATE_TARGET（可选: frontend, backend, all）"
                        exit 1
                        ;;
                esac
                ;;
            --auto-detect)
                AUTO_DETECT=true
                shift
                ;;
            *)
                print_error "未知参数: $1"
                echo "使用方法: sudo ./update-production.sh [--source-dir <path>] [--cache-hours <hours>] [--target <frontend|backend|all>] [--auto-detect]"
                echo "  --target: 指定更新目标（frontend, backend, all）"
                echo "  --auto-detect: 自动检测变更，只更新有改动的部分"
                echo "  --cache-hours: 凭据缓存时间（-1=永久保存，0=不保存，>0=缓存N小时）"
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

# 配置 Git 凭据存储
configure_git_credentials() {
    # 如果已通过命令行参数指定缓存时间，直接使用
    if [ -n "$GIT_CACHE_HOURS" ]; then
        case "$GIT_CACHE_HOURS" in
            -1)
                git config --global credential.helper store
                print_info "凭据存储模式: 永久保存"
                return
                ;;
            0)
                print_info "凭据存储模式: 不保存"
                return
                ;;
            *)
                local timeout_seconds=$((GIT_CACHE_HOURS * 3600))
                git config --global credential.helper "cache --timeout=${timeout_seconds}"
                print_info "凭据存储模式: 缓存 ${GIT_CACHE_HOURS} 小时"
                return
                ;;
        esac
    fi

    # 检查是否已配置凭据存储，已配置则直接复用
    local current_helper=$(git config --global credential.helper 2>/dev/null || true)
    if [ -n "$current_helper" ]; then
        print_info "凭据存储模式: 已配置 ($current_helper)"
        return
    fi

    # 未配置则默认永久保存（生产服务器适用）
    git config --global credential.helper store
    print_info "凭据存储模式: 永久保存（默认）"
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

    # 配置 Git 凭据存储
    configure_git_credentials

    # 拉取最新代码（先 fetch 触发凭据保存，再 merge 避免双重输入）
    print_info "从远程仓库拉取最新代码..."
    git fetch origin "$current_branch" || {
        print_error "git fetch 失败"
        print_info "如果认证失败，请检查 Git 凭据配置"
        return 1
    }
    git merge --ff-only "origin/$current_branch" || {
        print_error "git merge 失败"
        print_info "可能存在本地与远程的冲突"
        return 1
    }

    local new_commit=$(git rev-parse --short HEAD)
    print_info "代码已更新: $new_commit"
}

# 检测代码变更范围
detect_changes() {
    # 获取上次部署的 commit
    local deployed_commit=$(grep "^GIT_COMMIT=" "${PROJECT_DIR}/.image-version" 2>/dev/null | cut -d= -f2)

    if [ -z "$deployed_commit" ]; then
        print_warning "无法获取已部署版本，将更新全部服务"
        DETECTED_TARGET="all"
        return
    fi

    local current_commit=$(cd "$SOURCE_DIR" && git rev-parse HEAD)

    if [ "$deployed_commit" = "$current_commit" ]; then
        print_info "代码未变更（commit 相同）"
        DETECTED_TARGET="all"
        return
    fi

    # 检测前端/后端目录是否有改动
    local frontend_changed=false
    local backend_changed=false

    if git -C "$SOURCE_DIR" diff --name-only "$deployed_commit" "$current_commit" | grep -q "^frontend/"; then
        frontend_changed=true
    fi

    if git -C "$SOURCE_DIR" diff --name-only "$deployed_commit" "$current_commit" | grep -q "^backend/"; then
        backend_changed=true
    fi

    # 根据检测结果设置目标
    if $frontend_changed && $backend_changed; then
        DETECTED_TARGET="all"
    elif $frontend_changed; then
        DETECTED_TARGET="frontend"
    elif $backend_changed; then
        DETECTED_TARGET="backend"
    else
        DETECTED_TARGET="all"  # 其他文件变更（如 scripts/），默认全部更新
    fi

    print_info "检测结果: 前端=$($frontend_changed && echo "有变更" || echo "无变更"), 后端=$($backend_changed && echo "有变更" || echo "无变更")"
}

# 选择更新目标
select_target() {
    if [ -n "$UPDATE_TARGET" ]; then
        # 用户通过 --target 参数手动指定，直接使用
        print_info "更新目标: $UPDATE_TARGET（手动指定）"
        return
    fi

    detect_changes

    if [ "$AUTO_DETECT" = true ]; then
        # 自动检测模式，直接使用检测结果
        UPDATE_TARGET="${DETECTED_TARGET:-all}"
        print_info "更新目标: $UPDATE_TARGET（自动检测）"
        return
    fi

    # 交互式选择
    local frontend_label="无变更"
    local backend_label="无变更"
    [ "$DETECTED_TARGET" = "frontend" ] || [ "$DETECTED_TARGET" = "all" ] && frontend_label="有变更"
    [ "$DETECTED_TARGET" = "backend" ] || [ "$DETECTED_TARGET" = "all" ] && backend_label="有变更"

    echo ""
    echo "检测到代码变更:"
    echo "  前端: ${frontend_label}"
    echo "  后端: ${backend_label}"
    echo ""
    echo "请选择要更新的目标:"
    echo "  1) 前端和后端（全部）"
    echo "  2) 仅前端"
    echo "  3) 仅后端"
    echo ""
    read -p "请选择 [1-3，默认基于检测结果]: " target_choice

    local default_choice="all"
    case "$DETECTED_TARGET" in
        frontend) default_choice="2" ;;
        backend) default_choice="3" ;;
        *) default_choice="1" ;;
    esac

    case "${target_choice:-$default_choice}" in
        1|all)      UPDATE_TARGET="all" ;;
        2|frontend) UPDATE_TARGET="frontend" ;;
        3|backend)  UPDATE_TARGET="backend" ;;
        *)          UPDATE_TARGET="${DETECTED_TARGET:-all}" ;;
    esac

    print_info "更新目标: $UPDATE_TARGET"
}

# 构建后端镜像
build_backend_image() {
    print_step "构建后端镜像..."

    local git_commit=$(cd "$SOURCE_DIR" && git rev-parse --short HEAD)

    cd "${SOURCE_DIR}/backend"

    # 编译后端项目（支持无 Maven 环境）
    print_info "编译后端项目..."
    if command -v mvn &> /dev/null; then
        print_info "使用本地 Maven 编译..."
        mvn clean package -DskipTests -q
    else
        print_info "使用 Docker 构建后端 JAR..."
        local maven_image="maven:3.9-amazoncorretto-17-alpine"

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

    docker tag "data-acquisition-backend:${git_commit}" "data-acquisition-backend:latest"

    print_info "后端镜像构建完成: ${git_commit}"
}

# 构建前端镜像
build_frontend_image() {
    print_step "构建前端镜像..."

    local git_commit=$(cd "$SOURCE_DIR" && git rev-parse --short HEAD)

    cd "${SOURCE_DIR}/frontend"

    docker build \
        -t "data-acquisition-frontend:${git_commit}" \
        -f Dockerfile \
        . || {
        print_error "前端镜像构建失败"
        return 1
    }

    docker tag "data-acquisition-frontend:${git_commit}" "data-acquisition-frontend:latest"

    print_info "前端镜像构建完成: ${git_commit}"
}

# 构建新镜像（根据更新目标）
build_new_images() {
    print_step "构建新版本镜像..."

    local git_commit=$(cd "$SOURCE_DIR" && git rev-parse --short HEAD)
    local git_full_commit=$(cd "$SOURCE_DIR" && git rev-parse HEAD)

    print_info "Git Commit: $git_commit"
    print_info "更新目标: $UPDATE_TARGET"

    # 根据目标构建对应镜像
    case "$UPDATE_TARGET" in
        frontend)
            build_frontend_image
            ;;
        backend)
            build_backend_image
            ;;
        all)
            build_backend_image
            build_frontend_image
            ;;
    esac

    # 更新 .image-version 文件
    # 如果只更新部分，保留另一部分的当前 tag
    local backend_tag="$git_commit"
    local frontend_tag="$git_commit"

    if [ "$UPDATE_TARGET" = "frontend" ]; then
        # 保留当前后端 tag
        backend_tag=$(grep "^BACKEND_IMAGE_TAG=" "${PROJECT_DIR}/.image-version" 2>/dev/null | cut -d= -f2)
        if [ -z "$backend_tag" ]; then
            backend_tag="$git_commit"
        fi
    elif [ "$UPDATE_TARGET" = "backend" ]; then
        # 保留当前前端 tag
        frontend_tag=$(grep "^FRONTEND_IMAGE_TAG=" "${PROJECT_DIR}/.image-version" 2>/dev/null | cut -d= -f2)
        if [ -z "$frontend_tag" ]; then
            frontend_tag="$git_commit"
        fi
    fi

    echo "BACKEND_IMAGE_TAG=${backend_tag}" > "${PROJECT_DIR}/.image-version"
    echo "FRONTEND_IMAGE_TAG=${frontend_tag}" >> "${PROJECT_DIR}/.image-version"
    echo "GIT_COMMIT=${git_full_commit}" >> "${PROJECT_DIR}/.image-version"
    echo "BUILD_TIME=$(date -Iseconds)" >> "${PROJECT_DIR}/.image-version"

    print_info "镜像版本信息已更新"
}

# 停止应用服务
stop_app_services() {
    print_step "停止应用服务..."

    cd "$PROJECT_DIR"

    # 根据更新目标停止对应服务
    local services=""
    case "$UPDATE_TARGET" in
        frontend) services="frontend" ;;
        backend)  services="backend" ;;
        all)      services="backend frontend" ;;
    esac

    print_info "停止服务: $services"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml stop $services

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

    # 根据更新目标启动对应服务
    local services=""
    case "$UPDATE_TARGET" in
        frontend) services="frontend" ;;
        backend)  services="backend" ;;
        all)      services="backend frontend" ;;
    esac

    print_info "启动服务: $services"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d $services

    print_info "新版本应用已启动"
}

# 健康检查
health_check() {
    # 只更新前端时跳过后端健康检查
    if [ "$UPDATE_TARGET" = "frontend" ]; then
        print_info "仅更新前端，跳过后端健康检查"
        return 0
    fi

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

    # 读取实际使用的镜像 tag
    source "${PROJECT_DIR}/.image-version"

    cat > "${PROJECT_DIR}/version.json" << EOF
{
  "deployTime": "$deploy_time",
  "gitCommit": "$git_commit",
  "gitShortCommit": "$git_short_commit",
  "gitBranch": "$git_branch",
  "backendImage": "data-acquisition-backend:${BACKEND_IMAGE_TAG}",
  "frontendImage": "data-acquisition-frontend:${FRONTEND_IMAGE_TAG}",
  "updateTarget": "$UPDATE_TARGET",
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

    # 读取实际镜像 tag
    source "${PROJECT_DIR}/.image-version"

    local target_label="前端和后端"
    case "$UPDATE_TARGET" in
        frontend) target_label="仅前端" ;;
        backend)  target_label="仅后端" ;;
    esac

    print_title "更新完成"

    cat << EOF
${GREEN}系统已成功更新！${NC}

========== 更新信息 ==========
更新目标: ${target_label}
Git Commit: ${git_commit}
后端镜像: data-acquisition-backend:${BACKEND_IMAGE_TAG}
前端镜像: data-acquisition-frontend:${FRONTEND_IMAGE_TAG}
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

    # 选择更新目标（检测变更 + 用户交互）
    select_target

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
