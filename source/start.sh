#!/bin/bash

###############################################################################
# 数据采集系统 - 服务管理脚本
# 用途：启动/停止/重启前后端服务
# 使用：bash start.sh [start|stop|restart|status] [backend|frontend|all]
# 示例：bash start.sh stop all
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
SPRING_PROFILE="dev"
LOG_DIR="$SCRIPT_DIR/logs"

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
    local java_version=$("$JAVA_HOME/bin/java" -version 2>&1 | head -1)
    log_success "JDK检查通过：$java_version"

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
        if ! npm install; then
            log_error "前端依赖安装失败"
            exit 1
        fi
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

    # 创建日志目录
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
    fi

    # 设置环境变量（重要：确保Maven编译器能找到JDK）
    export JAVA_HOME="$JAVA_HOME"
    export PATH="$JAVA_HOME/bin:$PATH"

    # 启动后端
    cd "$SCRIPT_DIR"
    log_info "执行Maven启动命令（Profile: $SPRING_PROFILE）..."
    log_info "后端启动日志："

    local backend_log="$LOG_DIR/backend.log"

    # 后台启动后端，添加编译器配置
    nohup "$MAVEN_HOME/bin/mvn" -f backend/pom.xml \
        spring-boot:run \
        -Dspring-boot.run.profiles=$SPRING_PROFILE \
        -Dmaven.compiler.source=17 \
        -Dmaven.compiler.target=17 \
        -Dmaven.compiler.release=17 \
        > "$backend_log" 2>&1 &

    local backend_pid=$!
    log_info "后端进程PID: $backend_pid"
    log_info "等待后端服务启动..."

    # 等待后端启动
    local max_wait=90
    local wait_count=0
    local started=0

    while [ $wait_count -lt $max_wait ]; do
        # 实时显示日志
        if [ -f "$backend_log" ]; then
            tail -n 20 "$backend_log" 2>/dev/null || true
        fi

        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/api/doc.html >/dev/null 2>&1; then
            started=1
            break
        fi
        sleep 2
        wait_count=$((wait_count + 2))
        echo -n "."
    done

    echo ""

    if [ $started -eq 1 ]; then
        log_success "后端服务启动成功！"
        return 0
    else
        log_error "后端服务启动超时，请查看日志：$backend_log"
        # 显示最后的错误日志
        if [ -f "$backend_log" ]; then
            echo ""
            echo "--- 最后的日志输出 ---"
            tail -n 50 "$backend_log"
        fi
        return 1
    fi
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
    if netstat -ano 2>/dev/null | grep ":$PROTOTYPE_PORT " | grep "LISTENING" >/dev/null 2>&1; then
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
    echo -e "  前端界面："
    echo -e "    ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "  后端API："
    echo -e "    ${GREEN}http://localhost:$BACKEND_PORT/api${NC}"
    echo -e "  API文档："
    echo -e "    ${GREEN}http://localhost:$BACKEND_PORT/api/doc.html${NC}"
    echo ""
    echo -e "${BLUE}默认管理员账号：${NC}"
    echo -e "  用户名："
    echo -e "    ${GREEN}admin${NC}"
    echo -e "  密码："
    echo -e "    ${GREEN}admin123${NC}"
    echo ""
    echo -e "${YELLOW}提示：${NC}"
    echo -e "  - 后端日志：$LOG_DIR/backend.log"
    echo -e "  - 停止服务：bash start.sh stop [all|backend|frontend]"
    echo -e "  - 重启服务：bash start.sh restart [all|backend|frontend]"
    echo -e "  - 查看状态：bash start.sh status"
    echo ""
}

# 查找并停止进程
stop_process_by_port() {
    local port=$1
    local service_name=$2

    local pid=$(netstat -ano 2>/dev/null | grep ":$port " | grep "LISTENING" | awk '{print $5}' | head -1)

    if [ -n "$pid" ]; then
        log_info "正在停止 $service_name (PID: $pid)..."
        taskkill //F //PID $pid 2>/dev/null || true
        sleep 1
        log_success "$service_name 已停止"
    else
        log_info "$service_name 未运行"
    fi
}

# 查找并停止Java进程（后端）
stop_backend_process() {
    # 查找Maven启动的Java进程
    local pids=$(tasklist 2>/dev/null | grep -i "java.exe" | awk '{print $2}' | tr '\r' ' ')

    if [ -n "$pids" ]; then
        for pid in $pids; do
            # 检查是否是项目的Java进程（通过命令行或端口判断）
            if netstat -ano 2>/dev/null | grep ":$BACKEND_PORT " | grep "LISTENING" | grep "$pid" >/dev/null 2>&1; then
                log_info "正在停止后端进程 (PID: $pid)..."
                taskkill //F //PID $pid 2>/dev/null || true
                sleep 1
                log_success "后端进程已停止"
            fi
        done
    else
        log_info "后端进程未运行"
    fi
}

# 停止服务
stop_service() {
    local service_type=$1

    case "$service_type" in
        backend)
            log_info "正在停止后端服务..."
            stop_process_by_port $BACKEND_PORT "后端服务"
            stop_backend_process
            ;;
        frontend)
            log_info "正在停止前端服务..."
            stop_process_by_port $FRONTEND_PORT "前端服务"
            ;;
        all)
            log_info "正在停止所有服务..."
            stop_process_by_port $FRONTEND_PORT "前端服务"
            stop_process_by_port $BACKEND_PORT "后端服务"
            stop_backend_process
            ;;
    esac
    echo ""
}

# 查看服务状态
show_service_status() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  服务状态${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    # 检查前端
    local frontend_pid=$(netstat -ano 2>/dev/null | grep ":$FRONTEND_PORT " | grep "LISTENING" | awk '{print $5}' | head -1)
    echo -n "前端服务 (端口 $FRONTEND_PORT)："
    if [ -n "$frontend_pid" ]; then
        local process_name=$(tasklist 2>/dev/null | grep "$frontend_pid" | awk '{print $1}' | head -1)
        echo -e " ${GREEN}[运行中]${NC} PID: $frontend_pid ($process_name)"
    else
        echo -e " ${RED}[未运行]${NC}"
    fi

    # 检查后端
    local backend_pid=$(netstat -ano 2>/dev/null | grep ":$BACKEND_PORT " | grep "LISTENING" | awk '{print $5}' | head -1)
    echo -n "后端服务 (端口 $BACKEND_PORT)："
    if [ -n "$backend_pid" ]; then
        local process_name=$(tasklist 2>/dev/null | grep "$backend_pid" | awk '{print $1}' | head -1)
        echo -e " ${GREEN}[运行中]${NC} PID: $backend_pid ($process_name)"

        # 测试API
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/api/doc.html 2>/dev/null || echo "000")
        if [ "$http_code" = "200" ]; then
            echo -e "  ${GREEN}[API正常]${NC} HTTP $http_code"
        else
            echo -e "  ${YELLOW}[API异常]${NC} HTTP $http_code"
        fi
    else
        echo -e " ${RED}[未运行]${NC}"
    fi

    echo ""
}

# 重启服务
restart_service() {
    local service_type=$1

    log_info "正在重启 $service_type 服务..."
    echo ""

    # 先停止
    stop_service "$service_type"

    # 等待进程完全停止
    sleep 2

    # 再启动
    case "$service_type" in
        backend)
            if start_backend; then
                show_access_info
            fi
            ;;
        frontend)
            start_frontend
            ;;
        all)
            if ! start_backend; then
                log_error "后端启动失败，取消前端启动"
                exit 1
            fi
            echo ""
            log_success "后端服务已启动，正在启动前端..."
            sleep 3
            start_frontend
            ;;
    esac
}

# 启动服务
start_service() {
    local service_type=$1

    # 环境检查（仅启动时需要）
    check_environment
    check_frontend_dependencies

    case "$service_type" in
        backend)
            if start_backend; then
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

            if ! start_backend; then
                log_error "后端启动失败，取消前端启动"
                exit 1
            fi

            echo ""
            log_success "后端服务已启动，正在启动前端..."
            sleep 3
            start_frontend
            ;;
    esac
}

# 主函数
main() {
    # 解析参数
    local action="${1:-start}"
    local target="${2:-all}"

    # 验证action参数
    case "$action" in
        start|stop|restart|status)
            ;;
        *)
            log_error "未知操作：$action"
            echo "使用方法：bash start.sh [start|stop|restart|status] [backend|frontend|all]"
            echo "示例："
            echo "  bash start.sh start all      # 启动所有服务"
            echo "  bash start.sh stop backend   # 停止后端"
            echo "  bash start.sh restart all    # 重启所有服务"
            echo "  bash start.sh status         # 查看状态"
            exit 1
            ;;
    esac

    # 验证target参数（status不需要target）
    if [ "$action" != "status" ]; then
        case "$target" in
            backend|frontend|all)
                ;;
            *)
                log_error "未知目标：$target"
                echo "目标必须是：backend, frontend, 或 all"
                exit 1
                ;;
        esac
    fi

    # 根据操作执行
    case "$action" in
        start)
            print_header
            start_service "$target"
            ;;
        stop)
            print_header
            stop_service "$target"
            log_success "停止操作完成"
            ;;
        restart)
            print_header
            restart_service "$target"
            ;;
        status)
            show_service_status
            ;;
    esac
}

# 捕获Ctrl+C信号
trap 'echo ""; log_info "正在停止..."; exit 0' INT

# 执行主函数
main "$@"
