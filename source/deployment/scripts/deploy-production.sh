#!/bin/bash
##############################################################################
# 生产环境首次部署脚本
#
# 功能: 自动部署所有服务（依赖服务 + 应用服务）
#
# 使用方法:
#   sudo ./deploy-production.sh
#
# 部署内容:
#   - MySQL 8.0 (数据库)
#   - Redis 7 (缓存)
#   - MinIO (对象存储)
#   - Spring Boot 后端 (端口 8080)
#   - Vue 前端 (端口 80)
#
# 环境要求:
#   - Docker 20.10+
#   - Docker Compose 2.0+
#   - 内存: 最低 4GB，推荐 8GB
#   - 磁盘: 最低 20GB，推荐 50GB
#   - 操作系统: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
#
# 部署后访问:
#   - 前端页面: http://your-server-ip
#   - 后端API: http://your-server-ip:8080/api/v1
#   - MinIO控制台: http://your-server-ip:9001
#
# 默认账号:
#   用户名: admin
#   密码: admin123
#   (请在部署后立即修改)
#
# 生成的文件:
#   /opt/data-acquisition/.env              (环境配置)
#   /opt/data-acquisition/credentials.txt  (凭证信息，请妥善保管)
#   /opt/data-acquisition/version.json     (版本信息)
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
SOURCE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

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

# 检查系统环境
check_environment() {
    print_title "检查系统环境"

    # 检查操作系统
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        print_info "操作系统: $PRETTY_NAME"
    fi

    # 检查并安装 Docker
    if ! command -v docker &> /dev/null; then
        print_info "Docker 未安装，开始自动安装..."
        install_docker
    else
        print_info "Docker 已安装: $(docker --version)"
        # 确保 Docker 服务运行
        systemctl start docker 2>/dev/null || true
        systemctl enable docker 2>/dev/null || true
    fi

    # 检查并安装 Docker Compose
    if ! docker compose version &> /dev/null && ! docker-compose --version &> /dev/null; then
        print_info "Docker Compose 未安装，开始自动安装..."
        install_docker_compose
    else
        if docker compose version &> /dev/null 2>&1; then
            print_info "Docker Compose: $(docker compose version)"
        else
            print_info "Docker Compose: $(docker-compose --version)"
        fi
    fi

    # 配置 Docker 镜像加速（国内环境）
    configure_docker_mirror

    # 检查磁盘空间
    local available_space=$(df -BG "$PROJECT_DIR" 2>/dev/null | awk 'NR==2 {print $4}' | tr -d 'G')
    if [ "$available_space" -lt 10 ]; then
        print_warning "可用磁盘空间不足 10GB，当前: ${available_space}GB"
    else
        print_info "可用磁盘空间: ${available_space}GB"
    fi

    # 检查内存
    local total_mem=$(free -g | awk 'NR==2 {print $2}')
    if [ "$total_mem" -lt 2 ]; then
        print_warning "系统内存不足 2GB，当前: ${total_mem}GB"
    else
        print_info "系统内存: ${total_mem}GB"
    fi

    print_info "环境检查完成"
}

# 安装 Docker
install_docker() {
    # 检测系统类型
    if [ ! -f /etc/os-release ]; then
        print_error "无法检测操作系统类型，请手动安装 Docker"
        exit 1
    fi

    . /etc/os-release

    # 支持的 Debian/Ubuntu 系统
    if [[ "$ID" == "ubuntu" ]] || [[ "$ID" == "debian" ]]; then
        print_info "检测到 $ID 系统，开始安装 Docker..."

        # 更新包索引
        apt-get update -y

        # 安装依赖
        apt-get install -y \
            ca-certificates \
            curl \
            gnupg \
            lsb-release

        # 添加 Docker GPG 密钥
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/$ID/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg

        # 添加 Docker 仓库
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$ID \
          $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

        # 安装 Docker
        apt-get update -y
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        # 启动 Docker 服务
        systemctl start docker
        systemctl enable docker

        print_info "Docker 安装完成: $(docker --version)"
    else
        print_error "不支持的操作系统: $ID"
        print_info "请访问 https://docs.docker.com/engine/install/ 手动安装 Docker"
        exit 1
    fi
}

# 安装 Docker Compose
install_docker_compose() {
    # 如果插件版本已安装，跳过
    if docker compose version &> /dev/null 2>&1; then
        return
    fi

    print_info "安装 Docker Compose 独立版..."

    # 下载最新版本
    local compose_version="v2.24.0"
    curl -SL "https://github.com/docker/compose/releases/download/${compose_version}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    if docker-compose --version &> /dev/null 2>&1; then
        print_info "Docker Compose 安装完成: $(docker-compose --version)"
    else
        print_error "Docker Compose 安装失败"
        exit 1
    fi
}

# 配置 Docker 镜像加速
configure_docker_mirror() {
    local daemon_config="/etc/docker/daemon.json"

    # 检查是否已配置
    if [ -f "$daemon_config" ] && grep -q "registry-mirrors" "$daemon_config"; then
        print_info "Docker 镜像加速器已配置"
        return
    fi

    print_info "配置 Docker 镜像加速器..."

    mkdir -p /etc/docker

    # 配置国内镜像源
    cat > "$daemon_config" <<EOF
{
  "registry-mirrors": [
    "https://docker.xuanyuan.me",
    "https://docker.1ms.run",
    "https://dockerpull.org",
    "https://dockerhub.icu",
    "https://docker.chenby.cn",
    "https://docker.awsl9527.cn",
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

    # 重启 Docker 使配置生效
    systemctl daemon-reload
    systemctl restart docker

    print_info "镜像加速器配置完成"
}

# 生成随机密码
generate_password() {
    # 使用更兼容的密码生成方式
    if command -v openssl &> /dev/null; then
        # 尝试使用 base64 方式（更兼容）
        openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
    elif command -v tr &> /dev/null && command -v head &> /dev/null; then
        # 备用方案：使用 /dev/urandom
        tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 32
    else
        # 最后备用方案：固定时间戳+随机数
        echo "${RANDOM}$(date +%s)${RANDOM}$$" | md5sum | head -c 32
    fi
}

# 创建项目目录
create_directories() {
    print_title "创建项目目录"

    mkdir -p "$PROJECT_DIR"
    mkdir -p "$PROJECT_DIR/data/mysql"
    mkdir -p "$PROJECT_DIR/data/redis"
    mkdir -p "$PROJECT_DIR/data/minio"
    mkdir -p "$PROJECT_DIR/logs/backend"
    mkdir -p "$PROJECT_DIR/logs/nginx"
    mkdir -p "$PROJECT_DIR/backups"

    print_info "目录创建完成: $PROJECT_DIR"
}

# 生成环境变量文件
generate_env_file() {
    print_title "生成环境变量文件"

    local env_file="${PROJECT_DIR}/.env"

    # 检查是否已有 .env 文件
    if [ -f "$env_file" ]; then
        print_info "加载现有环境变量文件..."
        # 加载并导出环境变量
        set -a
        source "$env_file"
        set +a
        print_info "环境变量已加载"
        return
    fi

    # 生成随机密码
    local mysql_root_password=$(generate_password)
    local mysql_password=$(generate_password)
    local redis_password=$(generate_password)
    local minio_password=$(generate_password)

    # 导出环境变量供脚本使用
    export MYSQL_ROOT_PASSWORD="${mysql_root_password}"
    export MYSQL_DATABASE="data_acquisition"
    export MYSQL_USER="data_acquisition"
    export MYSQL_PASSWORD="${mysql_password}"
    export REDIS_PASSWORD="${redis_password}"
    export MINIO_ROOT_USER="admin"
    export MINIO_ROOT_PASSWORD="${minio_password}"

    # 创建环境变量文件
    cat > "$env_file" << EOF
# 数据采集系统 - 生产环境配置
# 生成时间: $(date)

# ========== MySQL 配置 ==========
MYSQL_ROOT_PASSWORD=${mysql_root_password}
MYSQL_DATABASE=data_acquisition
MYSQL_USER=data_acquisition
MYSQL_PASSWORD=${mysql_password}

# ========== Redis 配置 ==========
REDIS_PASSWORD=${redis_password}

# ========== MinIO 配置 ==========
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=${minio_password}
MINIO_BUCKET_NAME=data-acquisition

# ========== 后端配置 ==========
DB_HOST=mysql
DB_USERNAME=data_acquisition
DB_PASSWORD=\${MYSQL_PASSWORD}
REDIS_HOST=redis
REDIS_PASSWORD=\${REDIS_PASSWORD}
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=\${MINIO_ROOT_USER}
MINIO_SECRET_KEY=\${MINIO_ROOT_PASSWORD}

# ========== 钉钉配置（可选，按需填写）==========
DINGTALK_APP_KEY=
DINGTALK_APP_SECRET=
DINGTALK_AGENT_ID=
DINGTALK_CORP_ID=
DINGTALK_SYNC_ENABLED=false

# ========== 镜像版本 ==========
BACKEND_IMAGE_TAG=latest
FRONTEND_IMAGE_TAG=latest
EOF

    # 保存密码信息
    local creds_file="${PROJECT_DIR}/credentials.txt"
    cat > "$creds_file" << EOF
# 数据采集系统 - 凭证信息
# 生成时间: $(date)
# 请妥善保管此文件，删除后将无法找回密码

========== MySQL ==========
Root 密码: ${mysql_root_password}
数据库: data_acquisition
用户名: data_acquisition
密码: ${mysql_password}
连接地址: localhost:3306

========== Redis ==========
密码: ${redis_password}
连接地址: localhost:6379

========== MinIO ==========
控制台: http://localhost:9001
用户名: admin
密码: ${minio_password}
Access Key: admin
Secret Key: ${minio_password}
API 地址: http://localhost:9000

========== 系统默认账号 ==========
用户名: admin
密码: admin123
请登录后立即修改默认密码！
EOF

    chmod 600 "$creds_file"

    print_info "环境变量文件已生成: $env_file"
    print_warning "凭证信息已保存到: $creds_file"
    print_warning "请妥善保管凭证文件，并在部署后删除或移至安全位置"
}

# 复制配置文件
copy_configs() {
    print_title "复制配置文件"

    # 复制 docker-compose 文件
    cp "${SOURCE_DIR}/deployment/docker-compose.yml" "${PROJECT_DIR}/"
    cp "${SOURCE_DIR}/deployment/docker-compose.prod.yml" "${PROJECT_DIR}/"

    # 复制配置文件
    cp -r "${SOURCE_DIR}/deployment/config" "${PROJECT_DIR}/"

    print_info "配置文件复制完成"
}

# 构建镜像
build_images() {
    print_title "构建 Docker 镜像"

    local git_commit=$(cd "$SOURCE_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    local build_time=$(date +%Y%m%d-%H%M%S)

    print_info "Git Commit: $git_commit"

    # 检查并安装构建工具
    check_build_tools

    # 构建后端镜像
    print_info "准备构建后端镜像..."
    cd "${SOURCE_DIR}/backend"

    # 检查是否需要编译
    local jar_files=$(ls target/*.jar 2>/dev/null | wc -l)
    if [ ! -d "target" ] || [ "$jar_files" -eq 0 ]; then
        print_info "编译后端项目..."
        if command -v mvn &> /dev/null; then
            print_info "使用本地 Maven 编译..."
            mvn clean package -DskipTests
        else
            # 使用 Docker 构建 JAR（避免本地安装 Maven）
            print_info "使用 Docker 构建后端 JAR..."
            print_info "  (首次运行需要拉取 Maven 镜像，可能需要几分钟)"

            # 检查 Maven 镜像是否存在
            if ! docker image inspect maven:3.9-amazoncorretto-17-alpine &> /dev/null; then
                print_info "  正在拉取 maven:3.9-amazoncorretto-17-alpine 镜像..."
                print_info "  镜像大小约 400MB，请耐心等待..."
            fi

            docker run --rm \
                -v "$(pwd)":/app \
                -w /app \
                maven:3.9-amazoncorretto-17-alpine \
                mvn clean package -DskipTests
        fi
    else
        print_info "使用现有的 JAR 文件"
    fi

    print_info "构建后端 Docker 镜像..."
    docker build \
        -t "data-acquisition-backend:${git_commit}" \
        -t "data-acquisition-backend:latest" \
        -f Dockerfile \
        .

    # 构建前端镜像
    print_info "构建前端 Docker 镜像..."
    cd "${SOURCE_DIR}/frontend"

    docker build \
        -t "data-acquisition-frontend:${git_commit}" \
        -t "data-acquisition-frontend:latest" \
        -f Dockerfile \
        .

    print_info "镜像构建完成"
}

# 检查并安装构建工具
check_build_tools() {
    local need_maven=false
    local need_node=false

    # 检查 Maven（用于后端构建）
    if ! command -v mvn &> /dev/null; then
        print_info "Maven 未安装，将使用 Docker 容器构建"
    fi

    # 检查 Node.js（前端构建在 Docker 内完成，不需要）
}

# 初始化数据库
init_database() {
    print_title "初始化数据库"

    # 启动依赖服务
    print_info "启动依赖服务（MySQL、Redis、MinIO）..."
    cd "$PROJECT_DIR"
    docker compose up -d mysql redis minio

    # 等待 MySQL 就绪
    print_info "等待 MySQL 就绪..."
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker exec data-acquisition-mysql mysqladmin ping -h localhost -uroot -p"${MYSQL_ROOT_PASSWORD}" >/dev/null 2>&1; then
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    echo ""

    # 执行初始化脚本
    local schema_file="${PROJECT_DIR}/config/mysql/init_schema.sql"
    local data_file="${PROJECT_DIR}/config/mysql/init_data.sql"

    if [ -f "$schema_file" ]; then
        print_info "执行数据库结构初始化脚本..."
        docker exec -i data-acquisition-mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" < "$schema_file"
        print_info "数据库结构初始化完成"
    else
        print_warning "未找到数据库结构初始化脚本: $schema_file"
    fi

    if [ -f "$data_file" ]; then
        print_info "执行数据库数据初始化脚本..."
        docker exec -i data-acquisition-mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" < "$data_file"
        print_info "数据库数据初始化完成"
    else
        print_warning "未找到数据库数据初始化脚本: $data_file"
    fi

    if [ ! -f "$schema_file" ] && [ ! -f "$data_file" ]; then
        print_warning "未找到任何数据库初始化脚本，跳过"
    fi
}

# 启动应用服务
start_app_services() {
    print_title "启动应用服务"

    cd "$PROJECT_DIR"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

    print_info "应用服务启动完成"
    sleep 5
}

# 保存版本信息
save_version_info() {
    print_title "保存版本信息"

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

    print_info "版本信息已保存"
}

# 保存源码位置信息
save_source_info() {
    print_info "保存源码位置信息..."

    local source_info_file="${PROJECT_DIR}/source-info.json"

    # 获取 Git 信息（如果源码是 Git 仓库）
    local git_remote="unknown"
    local git_branch="unknown"
    local git_commit="unknown"

    if [ -d "${SOURCE_DIR}/.git" ]; then
        git_remote=$(cd "$SOURCE_DIR" && git remote get-url origin 2>/dev/null || echo "unknown")
        git_branch=$(cd "$SOURCE_DIR" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        git_commit=$(cd "$SOURCE_DIR" && git rev-parse HEAD 2>/dev/null || echo "unknown")
    fi

    # 计算源码相对于部署目录的路径
    # 首次部署时：源码在 ../.. 相对于脚本位置
    # 部署后：源码可能在不同位置，记录相对路径
    local relative_path_from_project=""
    if [[ "$SOURCE_DIR" == "$PROJECT_DIR"* ]]; then
        # 源码在部署目录内或子目录中
        relative_path_from_project="${SOURCE_DIR#$PROJECT_DIR}"
    fi

    # 保存路径信息
    cat > "$source_info_file" << EOF
{
  "sourceDir": "$SOURCE_DIR",
  "sourceType": "absolute",
  "deployTime": "$(date -Iseconds)",
  "gitRemote": "$git_remote",
  "gitBranch": "$git_branch",
  "gitCommit": "$git_commit",
  "note": "如源码位置变化，请使用 --source-dir 参数指定新位置"
}
EOF

    print_info "源码位置已记录: $source_info_file"
    print_info "  源码目录: $SOURCE_DIR"
}

# 健康检查
health_check() {
    print_title "健康检查"

    local script_dir="${SOURCE_DIR}/deployment/scripts"
    if [ -f "${script_dir}/health-check.sh" ]; then
        bash "${script_dir}/health-check.sh" || {
            print_error "健康检查失败，请检查日志"
            print_info "查看日志: ${PROJECT_DIR}/logs/"
            return 1
        }
    else
        print_warning "未找到健康检查脚本"
    fi
}

# 显示部署结果
show_result() {
    print_title "部署完成"

    cat << EOF
${GREEN}数据采集系统已成功部署！${NC}

========== 访问地址 ==========
前端页面: http://localhost
后端API: http://localhost:8080/api/v1
MinIO控制台: http://localhost:9001

========== 默认账号 ==========
用户名: admin
密码: admin123

========== 管理命令 ==========
查看状态: ${PROJECT_DIR}/scripts/manage.sh status
查看日志: ${PROJECT_DIR}/scripts/manage.sh logs
停止服务: ${PROJECT_DIR}/scripts/manage.sh stop
启动服务: ${PROJECT_DIR}/scripts/manage.sh start
健康检查: ${PROJECT_DIR}/scripts/manage.sh health

========== 凭证文件 ==========
${YELLOW}凭证信息保存在: ${PROJECT_DIR}/credentials.txt${NC}
${YELLOW}请妥善保管并及时删除此文件！${NC}

EOF
}

# 主函数
main() {
    print_title "数据采集系统 - 生产环境部署"

    # 执行部署步骤
    check_root
    check_environment
    create_directories
    generate_env_file
    copy_configs
    build_images
    init_database
    start_app_services
    save_version_info
    save_source_info

    # 健康检查
    if health_check; then
        show_result
    else
        print_error "部署过程中出现问题，请检查日志"
        exit 1
    fi
}

# 执行主函数
main "$@"
