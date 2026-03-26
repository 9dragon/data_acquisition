#!/bin/bash

###############################################################################
# 数据采集系统 - 一键启动脚本
# 用途：自动启动前后端服务
# 使用：bash start.sh [backend|frontend|all]
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 配置
JAVA_HOME="/c/Program Files/Java/jdk-17"
MAVEN_HOME="/d/devtools/apache-maven-3.6.0"
FRONTEND_PORT=3000
BACKEND_PORT=8080
PROTOTYPE_PORT=5173

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  数据采集系统 - 一键启动脚本${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查端口是否被占用
check_port() {
    local port=$1
    local service_name=$2

    if netstat -ano 2>/dev/null | grep ":$port " | grep "LISTENING" >/dev/null 2>&1; then
        log_warning "端口 $port ($service_name) 已被占用"
        local pid=$(netstat -ano 2>/dev/null | grep ":$port " | grep "LISTENING" | awk '{print $5}' | head -1)
        log_info "占用进程PID: $pid"
        read -p "是否停止占用进程? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            taskkill //F //PID $pid 2>/dev/null || true
            sleep 2
        else
            return 1
        fi
    fi
    return 0
}

# 环境检查
check_environment() {
    log_info "正在检查环境..."

    # 检查Java
    if [ ! -f "$JAVA_HOME/bin/java.exe" ] && [ ! -f "$JAVA_HOME/bin/java" ]; then
        log_error "JDK未找到：$JAVA_HOME"
        log_info "请确保JDK 17已安装在：$JAVA_HOME"
        exit 1
    fi
    log_success "JDK检查通过：$JAVA_HOME"

    # 检查Maven
    if [ ! -f "$MAVEN_HOME/bin/mvn" ] && [ ! -f "$MAVEN_HOME/bin/mvn.cmd" ]; then
        log_error "Maven未找到：$MAVEN_HOME"
        log_info "请确保Maven已安装在：$MAVEN_HOME"
        exit 1
    fi
    log_success "Maven检查通过：$MAVEN_HOME"

    # 检查Node.js
    if ! command_exists node; then
        log_error "Node.js未安装"
        log_info "请安装Node.js 18+"
        exit 1
    fi
    local node_version=$(node -v)
    log_success "Node.js检查通过：$node_version"

    # 检查npm
    if ! command_exists npm; then
        log_error "npm未安装"
        exit 1
    fi
    local npm_version=$(npm -v)
    log_success "npm检查通过：$npm_version"

    echo ""
}

# 检查前端依赖
check_frontend_dependencies() {
    log_info "检查前端依赖..."
    if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
        log_warning "前端依赖未安装，正在安装..."
        cd "$SCRIPT_DIR/frontend"
        npm install
        log_success "前端依赖安装完成"
    else
        log_success "前端依赖已安装"
    fi
    echo ""
}

# 启动后端
start_backend() {
    log_info "正在启动后端服务..."

    # 检查端口
    if ! check_port $BACKEND_PORT "后端服务"; then
        log_error "无法启动后端服务"
        return 1
    fi

    # 设置环境变量
    export JAVA_HOME="$JAVA_HOME"
    export PATH="$JAVA_HOME/bin:$PATH"

    # 启动后端
    cd "$SCRIPT_DIR"
    log_info "执行Maven启动命令..."
    log_info "后端日志："

    # 后台启动后端
    nohup "$MAVEN_HOME/bin/mvn" -f backend/pom.xml \
        spring-boot:run \
        -Dspring-boot.run.profiles=dev \
        > backend.log 2>&1 &

    local backend_pid=$!
    log_info "后端进程PID: $backend_pid"
    log_info "等待后端服务启动..."

    # 等待后端启动
    local max_wait=60
    local wait_count=0
    while [ $wait_count -lt $max_wait ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/api/doc.html >/dev/null 2>&1; then
            log_success "后端服务启动成功！"
            return 0
        fi
        sleep 2
        wait_count=$((wait_count + 2))
        echo -n "."
    done

    echo ""
    log_error "后端服务启动超时，请查看日志：backend.log"
    return 1
}

# 启动前端
start_frontend() {
    log_info "正在启动前端服务..."

    # 检查端口
    if ! check_port $FRONTEND_PORT "前端服务"; then
        log_error "无法启动前端服务"
        return 1
    fi

    # 检查原型端口（防止误启动）
    if check_port $PROTOTYPE_PORT "原型前端"; then
        log_warning "原型前端服务正在运行（端口$PROTOTYPE_PORT）"
        read -p "是否停止原型前端? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            local pid=$(netstat -ano 2>/dev/null | grep ":$PROTOTYPE_PORT " | grep "LISTENING" | awk '{print $5}' | head -1)
            taskkill //F //PID $pid 2>/dev/null || true
            sleep 2
        fi
    fi

    # 启动前端
    cd "$SCRIPT_DIR/frontend"
    log_info "执行npm启动命令..."

    # 前台启动前端
    npm run dev
}

# 显示访问地址
show_access_info() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  服务启动成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}访问地址：${NC}"
    echo -e "  前端界面：${GREEN}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "  后端API：  ${GREEN}http://localhost:$BACKEND_PORT/api${NC}"
    echo -e "  API文档：  ${GREEN}http://localhost:$BACKEND_PORT/api/doc.html${NC}"
    echo ""
    echo -e "${BLUE}默认管理员账号：${NC}"
    echo -e "  用户名：${GREEN}admin${NC}"
    echo -e "  密码：  ${GREEN}admin123${NC}"
    echo ""
    echo -e "${YELLOW}提示：${NC}"
    echo -e "  - 后端日志：$SCRIPT_DIR/backend.log"
    echo -e "  - 停止服务：Ctrl+C 或关闭命令行窗口"
    echo ""
}

# 主函数
main() {
    print_header

    # 解析参数
    local start_target="${1:-all}"

    # 环境检查
    check_environment

    # 检查前端依赖
    check_frontend_dependencies

    # 根据参数启动服务
    case "$start_target" in
        backend)
            start_backend
            if [ $? -eq 0 ]; then
                show_access_info
                log_info "后端服务已在后台运行"
            fi
            ;;
        frontend)
            start_frontend
            ;;
        all)
            log_info "正在启动所有服务..."
            echo ""

            # 启动后端
            start_backend
            if [ $? -ne 0 ]; then
                log_error "后端启动失败，取消前端启动"
                exit 1
            fi

            echo ""
            log_success "后端服务已启动，正在启动前端..."

            # 等待几秒确保后端完全启动
            sleep 5

            # 启动前端
            start_frontend
            ;;
        *)
            log_error "未知参数：$start_target"
            echo "使用方法：bash start.sh [backend|frontend|all]"
            exit 1
            ;;
    esac
}

# 捕获Ctrl+C信号
trap 'echo ""; log_info "正在停止..."; exit 0' INT

# 执行主函数
main "$@"
