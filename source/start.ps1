# 数据采集系统 - 一键启动脚本 (PowerShell)
# 用途：自动启动前后端服务
# 使用：powershell -ExecutionPolicy Bypass -File start.ps1 [backend|frontend|all]

param(
    [Parameter(Position=0)]
    [ValidateSet("backend", "frontend", "all")]
    [string]$Target = "all"
)

# 错误时停止
$ErrorActionPreference = "Stop"

# 配置
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$JAVA_HOME = "C:\Program Files\Java\jdk-17"
$MAVEN_HOME = "D:\devtools\apache-maven-3.6.0"
$FRONTEND_PORT = 3000
$BACKEND_PORT = 8080
$PROTOTYPE_PORT = 5173

# 颜色函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Log-Info {
    Write-ColorOutput Cyan "[INFO] $args"
}

function Log-Success {
    Write-ColorOutput Green "[SUCCESS] $args"
}

function Log-Warning {
    Write-ColorOutput Yellow "[WARNING] $args"
}

function Log-Error {
    Write-ColorOutput Red "[ERROR] $args"
}

function Print-Header {
    Write-Output ""
    Write-ColorOutput Cyan "========================================"
    Write-ColorOutput Cyan "  数据采集系统 - 一键启动脚本"
    Write-ColorOutput Cyan "========================================"
    Write-Output ""
}

# 检查端口是否被占用
function Test-Port {
    param([int]$Port, [string]$ServiceName)

    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
                  Where-Object { $_.State -eq "Listen" }

    if ($connection) {
        Log-Warning "端口 $Port ($ServiceName) 已被占用"
        $pid = $connection.OwningProcess
        Log-Info "占用进程PID: $pid"

        $response = Read-Host "是否停止占用进程? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            try {
                Stop-Process -Id $pid -Force
                Start-Sleep -Seconds 2
                return $true
            } catch {
                Log-Error "无法停止进程 $pid"
                return $false
            }
        } else {
            return $false
        }
    }
    return $true
}

# 环境检查
function Test-Environment {
    Log-Info "正在检查环境..."

    # 检查JDK
    if (-not (Test-Path "$JAVA_HOME\bin\java.exe")) {
        Log-Error "JDK未找到：$JAVA_HOME"
        Log-Info "请确保JDK 17已安装在：$JAVA_HOME"
        exit 1
    }
    Log-Success "JDK检查通过：$JAVA_HOME"

    # 检查Maven
    if (-not (Test-Path "$MAVEN_HOME\bin\mvn.cmd")) {
        Log-Error "Maven未找到：$MAVEN_HOME"
        Log-Info "请确保Maven已安装在：$MAVEN_HOME"
        exit 1
    }
    Log-Success "Maven检查通过：$MAVEN_HOME"

    # 检查Node.js
    try {
        $nodeVersion = node -v
        Log-Success "Node.js检查通过：$nodeVersion"
    } catch {
        Log-Error "Node.js未安装"
        Log-Info "请安装Node.js 18+"
        exit 1
    }

    # 检查npm
    try {
        $npmVersion = npm -v
        Log-Success "npm检查通过：$npmVersion"
    } catch {
        Log-Error "npm未安装"
        exit 1
    }

    Write-Output ""
}

# 检查前端依赖
function Test-FrontendDependencies {
    Log-Info "检查前端依赖..."

    $nodeModulesPath = Join-Path $SCRIPT_DIR "frontend\node_modules"

    if (-not (Test-Path $nodeModulesPath)) {
        Log-Warning "前端依赖未安装，正在安装..."
        Push-Location (Join-Path $SCRIPT_DIR "frontend")
        npm install
        Pop-Location
        Log-Success "前端依赖安装完成"
    } else {
        Log-Success "前端依赖已安装"
    }

    Write-Output ""
}

# 启动后端
function Start-BackendService {
    Log-Info "正在启动后端服务..."

    # 检查端口
    if (-not (Test-Port -Port $BACKEND_PORT -ServiceName "后端服务")) {
        Log-Error "无法启动后端服务"
        return $false
    }

    # 设置环境变量
    $env:JAVA_HOME = $JAVA_HOME
    $env:PATH = "$JAVA_HOME\bin;$env:PATH"

    # 启动后端
    Push-Location $SCRIPT_DIR
    Log-Info "执行Maven启动命令..."
    Log-Info "后端日志："

    $backendLog = Join-Path $SCRIPT_DIR "backend.log"

    # 后台启动后端
    $process = Start-Process -FilePath "$MAVEN_HOME\bin\mvn.cmd" `
        -ArgumentList "-f backend\pom.xml", "spring-boot:run", "-Dspring-boot.run.profiles=prod" `
        -NoNewWindow `
        -RedirectStandardOutput $backendLog `
        -PassThru

    Log-Info "后端进程PID: $($process.Id)"
    Log-Info "等待后端服务启动..."

    # 等待后端启动
    $maxWait = 60
    $waitCount = 0
    $started = $false

    while ($waitCount -lt $maxWait) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/api/doc.html" `
                -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $started = $true
                break
            }
        } catch {
            # 继续等待
        }

        Start-Sleep -Seconds 2
        $waitCount += 2
        Write-Host "." -NoNewline
    }

    Write-Host ""

    if ($started) {
        Log-Success "后端服务启动成功！"
        Pop-Location
        return $true
    } else {
        Log-Error "后端服务启动超时，请查看日志：$backendLog"
        Pop-Location
        return $false
    }
}

# 启动前端
function Start-FrontendService {
    Log-Info "正在启动前端服务..."

    # 检查端口
    if (-not (Test-Port -Port $FRONTEND_PORT -ServiceName "前端服务")) {
        Log-Error "无法启动前端服务"
        return $false
    }

    # 检查原型端口
    $protoConnection = Get-NetTCPConnection -LocalPort $PROTOTYPE_PORT -ErrorAction SilentlyContinue |
                        Where-Object { $_.State -eq "Listen" }

    if ($protoConnection) {
        Log-Warning "原型前端服务正在运行（端口$PROTOTYPE_PORT）"
        $response = Read-Host "是否停止原型前端? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            try {
                Stop-Process -Id $protoConnection.OwningProcess -Force
                Start-Sleep -Seconds 2
            } catch {
                Log-Warning "无法停止原型前端进程"
            }
        }
    }

    # 启动前端
    Push-Location (Join-Path $SCRIPT_DIR "frontend")
    Log-Info "执行npm启动命令..."

    # 前台启动前端
    npm run dev

    Pop-Location
}

# 显示访问地址
function Show-AccessInfo {
    Write-Output ""
    Write-ColorOutput Green "========================================"
    Write-ColorOutput Green "  服务启动成功！"
    Write-ColorOutput Green "========================================"
    Write-Output ""
    Write-ColorOutput Cyan "访问地址："
    Write-Output "  前端界面：$(Write-ColorOutput Green http://localhost:$FRONTEND_PORT)"
    Write-Output "  后端API：  $(Write-ColorOutput Green http://localhost:$BACKEND_PORT/api)"
    Write-Output "  API文档：  $(Write-ColorOutput Green http://localhost:$BACKEND_PORT/api/doc.html)"
    Write-Output ""
    Write-ColorOutput Cyan "默认管理员账号："
    Write-Output "  用户名：$(Write-ColorOutput Green admin)"
    Write-Output "  密码：  $(Write-ColorOutput Green admin123)"
    Write-Output ""
    Write-ColorOutput Yellow "提示："
    Write-Output "  - 后端日志：$SCRIPT_DIR\backend.log"
    Write-Output "  - 停止服务：Ctrl+C 或关闭命令行窗口"
    Write-Output ""
}

# 主函数
function Main {
    Print-Header

    # 环境检查
    Test-Environment

    # 检查前端依赖
    Test-FrontendDependencies

    # 根据参数启动服务
    switch ($Target) {
        "backend" {
            if (Start-BackendService) {
                Show-AccessInfo
                Log-Info "后端服务已在后台运行"
            }
        }
        "frontend" {
            Start-FrontendService
        }
        "all" {
            Log-Info "正在启动所有服务..."
            Write-Output ""

            # 启动后端
            if (-not (Start-BackendService)) {
                Log-Error "后端启动失败，取消前端启动"
                exit 1
            }

            Write-Output ""
            Log-Success "后端服务已启动，正在启动前端..."

            # 等待几秒确保后端完全启动
            Start-Sleep -Seconds 5

            # 启动前端
            Start-FrontendService
        }
    }
}

# 执行主函数
try {
    Main
} catch {
    Log-Error "启动过程中发生错误：$_"
    exit 1
}
