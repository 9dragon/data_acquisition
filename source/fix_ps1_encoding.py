# -*- coding: utf-8 -*-
import codecs

content = r"""# 数据采集系统 - 服务管理脚本 (PowerShell)
# 用途：启动/停止/重启前后端服务
# 使用：powershell -ExecutionPolicy Bypass -File start.ps1 [start|stop|restart|status] [backend|frontend|all]

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status')]
    [string]$Action = 'start',

    [Parameter(Position=1)]
    [ValidateSet('backend', 'frontend', 'all')]
    [string]$Target = 'all'
)

$ErrorActionPreference = 'Stop'

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$JAVA_HOME = 'C:\Program Files\Java\jdk-17'
$MAVEN_HOME = 'D:\devtools\apache-maven-3.6.0'
$FRONTEND_PORT = 3000
$BACKEND_PORT = 8080
$PROTOTYPE_PORT = 5173
$SPRING_PROFILE = 'dev'

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) { Write-Output $args }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Log-Info { Write-ColorOutput Cyan "[INFO] $args" }
function Log-Success { Write-ColorOutput Green "[SUCCESS] $args" }
function Log-Warning { Write-ColorOutput Yellow "[WARNING] $args" }
function Log-Error { Write-ColorOutput Red "[ERROR] $args" }

function Print-Header {
    Write-Output ''
    Write-ColorOutput Cyan '========================================'
    Write-ColorOutput Cyan '  数据采集系统 - 服务管理脚本'
    Write-ColorOutput Cyan '========================================'
    Write-Output ''
}

function Test-Port {
    param([int]$Port, [string]$ServiceName)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    if ($connection) {
        Log-Warning "端口 $Port ($ServiceName) 已被占用"
        $procId = $connection.OwningProcess
        Log-Info "占用进程PID: $procId"
        $response = Read-Host "是否停止占用进程? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            try { Stop-Process -Id $procId -Force; Start-Sleep -Seconds 2; return $true }
            catch { Log-Error "无法停止进程 $procId"; return $false }
        } else { return $false }
    }
    return $true
}

function Test-Environment {
    Log-Info '正在检查环境...'
    if (-not (Test-Path "$JAVA_HOME\bin\java.exe")) {
        Log-Error "JDK未找到：$JAVA_HOME"
        Log-Info '请确保JDK 17已安装在：$JAVA_HOME'
        exit 1
    }
    $javaVersion = & "$JAVA_HOME\bin\java.exe" -version 2>&1 | Select-Object -First 1
    Log-Success "JDK检查通过：$javaVersion"

    if (-not (Test-Path "$MAVEN_HOME\bin\mvn.cmd")) {
        Log-Error "Maven未找到：$MAVEN_HOME"
        Log-Info '请确保Maven已安装在：$MAVEN_HOME'
        exit 1
    }
    Log-Success "Maven检查通过：$MAVEN_HOME"

    try { $nodeVersion = node -v; Log-Success "Node.js检查通过：$nodeVersion" }
    catch { Log-Error 'Node.js未安装'; Log-Info '请安装Node.js 18+'; exit 1 }

    try { $npmVersion = npm -v; Log-Success "npm检查通过：$npmVersion" }
    catch { Log-Error 'npm未安装'; exit 1 }

    Write-Output ''
}

function Test-FrontendDependencies {
    Log-Info '检查前端依赖...'
    $nodeModulesPath = Join-Path $SCRIPT_DIR 'frontend\node_modules'
    if (-not (Test-Path $nodeModulesPath)) {
        Log-Warning '前端依赖未安装，正在安装...'
        Push-Location (Join-Path $SCRIPT_DIR 'frontend')
        npm install
        if ($LASTEXITCODE -ne 0) { Pop-Location; Log-Error '前端依赖安装失败'; exit 1 }
        Pop-Location
        Log-Success '前端依赖安装完成'
    } else { Log-Success '前端依赖已安装' }
    Write-Output ''
}

function Start-BackendService {
    Log-Info '正在启动后端服务...'
    if (-not (Test-Port -Port $BACKEND_PORT -ServiceName '后端服务')) {
        Log-Error '无法启动后端服务'
        return $false
    }

    $env:JAVA_HOME = $JAVA_HOME
    $env:PATH = "$JAVA_HOME\bin;$env:PATH"

    Push-Location $SCRIPT_DIR
    Log-Info "执行Maven启动命令（Profile: $SPRING_PROFILE）..."

    $backendLog = Join-Path $SCRIPT_DIR 'logs\backend.log'
    $logsDir = Split-Path $backendLog -Parent
    if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir -Force | Out-Null }

    $mavenArgs = @('-f', 'backend\pom.xml', 'spring-boot:run', "-Dspring-boot.run.profiles=$SPRING_PROFILE", '-Dmaven.compiler.source=17', '-Dmaven.compiler.target=17', '-Dmaven.compiler.release=17')

    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "$MAVEN_HOME\bin\mvn.cmd"
    $processInfo.Arguments = $mavenArgs -join ' '
    $processInfo.UseShellExecute = $false
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.CreateNoWindow = $true
    $processInfo.Environment['JAVA_HOME'] = $JAVA_HOME

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo
    $process.Start() | Out-Null

    Log-Info "后端进程PID: $($process.Id)"
    Log-Info '等待后端服务启动...'

    $maxWait = 90
    $waitCount = 0
    $started = $false
    while ($waitCount -lt $maxWait) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/api/doc.html" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($response.StatusCode -eq 200) { $started = $true; break }
        } catch { }
        Start-Sleep -Seconds 2
        $waitCount += 2
        Write-Host '.' -NoNewline
    }

    Write-Host ''
    if ($started) {
        Log-Success '后端服务启动成功！'
        Pop-Location
        return $true
    } else {
        Log-Error "后端服务启动超时，请查看日志：$backendLog"
        $process.Kill()
        Pop-Location
        return $false
    }
}

function Start-FrontendService {
    Log-Info '正在启动前端服务...'
    if (-not (Test-Port -Port $FRONTEND_PORT -ServiceName '前端服务')) {
        Log-Error '无法启动前端服务'
        return $false
    }

    $protoConnection = Get-NetTCPConnection -LocalPort $PROTOTYPE_PORT -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    if ($protoConnection) {
        Log-Warning "原型前端服务正在运行（端口$PROTOTYPE_PORT）"
        $response = Read-Host '是否停止原型前端? (y/N)'
        if ($response -eq 'y' -or $response -eq 'Y') {
            try { Stop-Process -Id $protoConnection.OwningProcess -Force; Start-Sleep -Seconds 2 }
            catch { Log-Warning '无法停止原型前端进程' }
        }
    }

    Push-Location (Join-Path $SCRIPT_DIR 'frontend')
    Log-Info '执行npm启动命令...'
    npm run dev
    Pop-Location
}

function Show-AccessInfo {
    Write-Output ''
    Write-ColorOutput Green '========================================'
    Write-ColorOutput Green '  服务启动成功！'
    Write-ColorOutput Green '========================================'
    Write-Output ''
    Write-ColorOutput Cyan '访问地址：'
    Write-Output '  前端界面：'
    Write-ColorOutput Green "    http://localhost:$FRONTEND_PORT"
    Write-Output '  后端API：'
    Write-ColorOutput Green "    http://localhost:$BACKEND_PORT/api"
    Write-Output '  API文档：'
    Write-ColorOutput Green "    http://localhost:$BACKEND_PORT/api/doc.html"
    Write-Output ''
    Write-ColorOutput Cyan '默认管理员账号：'
    Write-Output '  用户名：'
    Write-ColorOutput Green '    admin'
    Write-Output '  密码：'
    Write-ColorOutput Green '    admin123'
    Write-Output ''
    Write-ColorOutput Yellow '提示：'
    Write-Output "  - 后端日志：$SCRIPT_DIR\logs\backend.log"
    Write-Output '  - 停止服务：.\start.ps1 stop [all|backend|frontend]'
    Write-Output '  - 重启服务：.\start.ps1 restart [all|backend|frontend]'
    Write-Output '  - 查看状态：.\start.ps1 status'
    Write-Output ''
}

function Stop-ProcessByPort {
    param([int]$Port, [string]$ServiceName)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    if ($connection) {
        $procId = $connection.OwningProcess
        try {
            $process = Get-Process -Id $procId -ErrorAction SilentlyContinue
            $processName = if ($process) { $process.ProcessName } else { 'Unknown' }
            Log-Info "正在停止 $ServiceName (PID: $procId, $processName)..."
            Stop-Process -Id $procId -Force
            Start-Sleep -Seconds 1
            Log-Success "$ServiceName 已停止"
            return $true
        } catch {
            Log-Warning "无法停止 $ServiceName (PID: $procId): $_"
            return $false
        }
    } else {
        Log-Info "$ServiceName 未运行"
        return $true
    }
}

function Stop-BackendProcess {
    $javaProcesses = Get-Process -Name 'java' -ErrorAction SilentlyContinue | Where-Object {
        try { $_.CommandLine -like '*data-acquisition*' -or $_.CommandLine -like '*spring-boot:run*' }
        catch { $false }
    }
    if ($javaProcesses) {
        foreach ($proc in $javaProcesses) {
            Log-Info "正在停止后端进程 (PID: $($proc.Id))..."
            try { Stop-Process -Id $proc.Id -Force; Start-Sleep -Seconds 1; Log-Success '后端进程已停止' }
            catch { Log-Warning "无法停止进程 $($proc.Id): $_" }
        }
    } else { Log-Info '后端进程未运行' }
}

function Stop-Service {
    param([string]$ServiceType)
    switch ($ServiceType) {
        'backend' {
            Log-Info '正在停止后端服务...'
            Stop-ProcessByPort -Port $BACKEND_PORT -ServiceName '后端服务'
            Stop-BackendProcess
        }
        'frontend' {
            Log-Info '正在停止前端服务...'
            Stop-ProcessByPort -Port $FRONTEND_PORT -ServiceName '前端服务'
        }
        'all' {
            Log-Info '正在停止所有服务...'
            Stop-ProcessByPort -Port $FRONTEND_PORT -ServiceName '前端服务'
            Stop-ProcessByPort -Port $BACKEND_PORT -ServiceName '后端服务'
            Stop-BackendProcess
        }
    }
    Write-Output ''
}

function Show-ServiceStatus {
    Write-Output ''
    Write-ColorOutput Cyan '========================================'
    Write-ColorOutput Cyan '  服务状态'
    Write-ColorOutput Cyan '========================================'
    Write-Output ''

    $frontendConnection = Get-NetTCPConnection -LocalPort $FRONTEND_PORT -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    Write-Output "前端服务 (端口 $FRONTEND_PORT)："
    if ($frontendConnection) {
        $procId = $frontendConnection.OwningProcess
        $process = Get-Process -Id $procId -ErrorAction SilentlyContinue
        $processName = if ($process) { $process.ProcessName } else { 'Unknown' }
        Write-ColorOutput Green "  [运行中] PID: $procId ($processName)"
    } else { Write-ColorOutput Red '  [未运行]' }

    $backendConnection = Get-NetTCPConnection -LocalPort $BACKEND_PORT -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    Write-Output "后端服务 (端口 $BACKEND_PORT)："
    if ($backendConnection) {
        $procId = $backendConnection.OwningProcess
        $process = Get-Process -Id $procId -ErrorAction SilentlyContinue
        $processName = if ($process) { $process.ProcessName } else { 'Unknown' }
        Write-ColorOutput Green "  [运行中] PID: $procId ($processName)"
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/api/doc.html" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            Write-ColorOutput Green "  [API正常] HTTP $($response.StatusCode)"
        } catch { Write-ColorOutput Yellow "  [API异常] $($_.Exception.Message)" }
    } else { Write-ColorOutput Red '  [未运行]' }
    Write-Output ''
}

function Restart-Service {
    param([string]$ServiceType)
    Log-Info "正在重启 $ServiceType 服务..."
    Write-Output ''
    Stop-Service -ServiceType $ServiceType
    Start-Sleep -Seconds 2
    switch ($ServiceType) {
        'backend' { if (Start-BackendService) { Show-AccessInfo } }
        'frontend' { Start-FrontendService }
        'all' {
            if (-not (Start-BackendService)) { Log-Error '后端启动失败，取消前端启动'; exit 1 }
            Write-Output ''
            Log-Success '后端服务已启动，正在启动前端...'
            Start-Sleep -Seconds 3
            Start-FrontendService
        }
    }
}

function Start-ServiceFunc {
    param([string]$ServiceType)
    Test-Environment
    Test-FrontendDependencies
    switch ($ServiceType) {
        'backend' { if (Start-BackendService) { Show-AccessInfo; Log-Info '后端服务已在后台运行' } }
        'frontend' { Start-FrontendService }
        'all' {
            Log-Info '正在启动所有服务...'
            Write-Output ''
            if (-not (Start-BackendService)) { Log-Error '后端启动失败，取消前端启动'; exit 1 }
            Write-Output ''
            Log-Success '后端服务已启动，正在启动前端...'
            Start-Sleep -Seconds 3
            Start-FrontendService
        }
    }
}

function Main {
    switch ($Action) {
        'start' { Print-Header; Start-ServiceFunc -ServiceType $Target }
        'stop' { Print-Header; Stop-Service -ServiceType $Target; Log-Success '停止操作完成' }
        'restart' { Print-Header; Restart-Service -ServiceType $Target }
        'status' { Show-ServiceStatus }
    }
}

try { Main } catch { Log-Error "启动过程中发生错误：$_"; exit 1 }
"""

# Write with UTF-8 BOM encoding
with codecs.open(r'D:\work\projects\data_acquisition\source\start.ps1', 'w', 'utf-8-sig') as f:
    f.write(content)

print('PowerShell script written with UTF-8 BOM encoding')
