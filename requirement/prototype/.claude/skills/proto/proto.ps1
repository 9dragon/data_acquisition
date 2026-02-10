# proto.ps1 - Data Acquisition Prototype Frontend Service Management Script
# Supports start, stop, restart and status operations

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'help')]
    [string]$Action = 'start'
)

# Configuration
$NODE_VERSION = "18.20.3"
$FRONTEND_PORT = 5173
$FRONTEND_DIR = "frontend"
# Get project root from skill directory location (up 3 levels)
$PROJECT_ROOT = if ($PSScriptRoot) {
    $PSScriptRoot | Split-Path | Split-Path | Split-Path
} else {
    # Fallback when script is not being executed directly
    Get-Location
}

# Color output functions
function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

# Switch Node version using nvm
function Switch-NodeVersion {
    param([string]$Version)

    Write-Info "Switching to Node $Version using nvm..."

    # Check if nvm is available
    $nvmPath = Get-Command nvm -ErrorAction SilentlyContinue
    if (-not $nvmPath) {
        # Try common nvm installation paths
        $nvmPaths = @(
            "$env:NVM_HOME\nvm.exe",
            "$env:APPDATA\nvm\nvm.exe",
            "$env:LOCALAPPDATA\nvm\nvm.exe"
        )
        foreach ($path in $nvmPaths) {
            if (Test-Path $path) {
                $nvmPath = $path
                break
            }
        }
    }

    if (-not $nvmPath) {
        Write-Error-Custom "[FAIL] nvm not found. Please install nvm for Windows."
        return $false
    }

    try {
        # Use nvm to switch version
        $nvmExe = if ($nvmPath -is [string]) { $nvmPath } else { $nvmPath.Source }
        & $nvmExe use $Version 2>&1 | Out-Null

        # Verify the version
        $currentVersion = node --version 2>$null
        if ($currentVersion -match "v$Version") {
            Write-Success "[OK] Switched to Node $currentVersion"
            return $true
        } else {
            Write-Warning-Custom "[WARN] Node version is $currentVersion (expected v$Version)"
            return $true
        }
    } catch {
        Write-Error-Custom "[FAIL] Failed to switch Node version: $_"
        return $false
    }
}

# Get process by port using netstat
function Get-ProcessByPort {
    param([int]$Port)
    try {
        $output = cmd /c "netstat -ano 2>nul" 2>$null
        foreach ($line in $output) {
            if ($line -match "TCP.*:$Port.*LISTENING") {
                $parts = $line.Trim() -split '\s+'
                $procId = $parts[-1]
                if ($procId -match '^\d+$') {
                    $process = Get-Process -Id $procId -ErrorAction SilentlyContinue
                    return $process
                }
            }
        }
    } catch {
        return $null
    }
    return $null
}

# Find Vite frontend process
function Get-FrontendProcess {
    $portProcess = Get-ProcessByPort -Port $FRONTEND_PORT
    if ($portProcess) {
        return $portProcess
    }

    # Fallback: find by process name
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    foreach ($proc in $nodeProcesses) {
        try {
            $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId=$($proc.Id)").CommandLine
            if ($cmdLine -and ($cmdLine -match "vite" -or $cmdLine -match "dev")) {
                return $proc
            }
        } catch { }
    }
    return $null
}

# Check service status
function Get-ServiceStatus {
    $frontend = Get-FrontendProcess

    return @{
        Frontend = @{
            Running = ($null -ne $frontend)
            PID = if ($frontend) { $frontend.Id } else { "N/A" }
            Port = $FRONTEND_PORT
        }
    }
}

# Display service status
function Show-ServiceStatus {
    $status = Get-ServiceStatus

    Write-Info ""
    Write-Info "=========================================="
    Write-Info "   Service Status - Data Acquisition Prototype"
    Write-Info "=========================================="
    Write-Host ""

    Write-Host "+-----------+--------+------+---------+"
    Write-Host "| Service   | Status | Port | PID     |"
    Write-Host "+-----------+--------+------+---------+"

    # Frontend status
    $frontendRunning = $status.Frontend.Running
    $frontendStatusText = if ($frontendRunning) { "Running" } else { "Stopped" }
    $frontendPid = $status.Frontend.PID
    $frontendPort = $status.Frontend.Port
    $foregroundColor = if ($frontendRunning) { "Green" } else { "Red" }
    Write-Host ("| Frontend  | {0,-6} | {1,-4} | {2,-7} |" -f $frontendStatusText, $frontendPort, $frontendPid) -ForegroundColor $foregroundColor

    Write-Host "+-----------+--------+------+---------+"
    Write-Host ""

    # Display access URLs
    if ($status.Frontend.Running) {
        Write-Info "Access URL:"
        Write-Success "  * Frontend: http://localhost:$FRONTEND_PORT"
        Write-Host ""

        # Show node version
        $nodeVersion = node --version 2>$null
        Write-Info "Node Version: $nodeVersion"
        Write-Host ""
    }
}

# Start services
function Start-Service {
    $status = Get-ServiceStatus

    if ($status.Frontend.Running) {
        Write-Warning-Custom "Frontend service is already running:"
        Write-Warning-Custom "  * Frontend (PID: $($status.Frontend.PID))"
        Write-Warning-Custom ""
        Write-Warning-Custom "Use '/proto stop' to stop service, or '/proto restart' to restart"
        return
    }

    Write-Info ""
    Write-Info "=========================================="
    Write-Info "   Starting Data Acquisition Prototype"
    Write-Info "=========================================="
    Write-Host ""

    # Switch to correct Node version
    $nodeSwitched = Switch-NodeVersion -Version $NODE_VERSION
    if (-not $nodeSwitched) {
        Write-Error-Custom ""
        Write-Error-Custom "[FAIL] Cannot proceed without correct Node version"
        return
    }

    # Change to project root
    Push-Location $PROJECT_ROOT

    # Start frontend
    Write-Info "Starting frontend service..."
    $frontendDir = Join-Path $PROJECT_ROOT $FRONTEND_DIR
    if (Test-Path $frontendDir) {
        try {
            Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $frontendDir -WindowStyle Hidden
            Write-Success "[OK] Frontend started (port: $FRONTEND_PORT)"
            Start-Sleep -Seconds 1
        } catch {
            Write-Error-Custom "[FAIL] Frontend start failed: $_"
        }
    } else {
        Write-Error-Custom "[FAIL] Frontend directory not found: $frontendDir"
    }

    Pop-Location

    # Wait for service to start and show status
    Write-Info ""
    Write-Info "Waiting for service to start..."
    Start-Sleep -Seconds 3
    Show-ServiceStatus
}

# Stop services by port
function Stop-ServiceByPort {
    param([int]$Port, [string]$Name)

    try {
        $output = cmd /c "netstat -ano 2>nul" 2>$null
        foreach ($line in $output) {
            if ($line -match "TCP.*:$Port.*LISTENING") {
                $parts = $line.Trim() -split '\s+'
                $procId = $parts[-1]
                if ($procId -match '^\d+$') {
                    taskkill /F /PID $procId > $null 2>&1
                    return $procId
                }
            }
        }
    } catch {
        return $null
    }
    return $null
}

# Stop services
function Stop-Service {
    Write-Info ""
    Write-Info "=========================================="
    Write-Info "   Stopping Data Acquisition Prototype"
    Write-Info "=========================================="
    Write-Host ""

    $stopped = $false

    # Stop frontend by port
    $frontendPid = Stop-ServiceByPort -Port $FRONTEND_PORT -Name "Frontend"
    if ($frontendPid) {
        Write-Success "[OK] Frontend stopped (PID: $frontendPid)"
        $stopped = $true
    } else {
        Write-Warning-Custom "[INFO] Frontend not running"
    }

    if (-not $stopped) {
        Write-Warning-Custom ""
        Write-Warning-Custom "No services are running"
        return
    }

    # Wait for port to be released
    Write-Info ""
    Write-Info "Waiting for port to be released..."
    Start-Sleep -Seconds 2

    # Verify port status
    $frontendCheck = Get-ProcessByPort -Port $FRONTEND_PORT

    if ($frontendCheck) {
        Write-Warning-Custom "[WARN] Port may still be in use, trying force stop..."
        Stop-ServiceByPort -Port $FRONTEND_PORT -Name "Frontend" | Out-Null
        Start-Sleep -Seconds 1
    }

    Write-Success ""
    Write-Success "[OK] Service stopped successfully"
    Write-Host ""
}

# Restart services
function Restart-Service {
    Write-Info ""
    Write-Info "=========================================="
    Write-Info "   Restarting Data Acquisition Prototype"
    Write-Info "=========================================="
    Write-Host ""

    Write-Info "Stopping existing service..."
    Stop-Service

    Write-Info "Waiting for port to be released..."
    Start-Sleep -Seconds 3

    Write-Info ""
    Write-Info "Restarting service..."
    Start-Service
}

# Show help
function Show-Help {
    Write-Info ""
    Write-Info "=========================================="
    Write-Info "   Data Acquisition Prototype Management"
    Write-Info "=========================================="
    Write-Host ""

    Write-Host "Usage: /proto [action]"
    Write-Host ""
    Write-Host "Actions:"
    Write-Host "  (none)  - Start frontend service (default)"
    Write-Host "  start   - Start frontend service"
    Write-Host "  status  - Show service running status"
    Write-Host "  restart - Restart frontend service"
    Write-Host "  stop    - Stop frontend service"
    Write-Host "  help    - Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  /proto         # Start service"
    Write-Host "  /proto status  # Show status"
    Write-Host "  /proto restart # Restart service"
    Write-Host "  /proto stop    # Stop service"
    Write-Host ""
    Write-Host "Configuration:"
    Write-Host "  Node Version:  $NODE_VERSION"
    Write-Host "  Frontend Port: $FRONTEND_PORT"
    Write-Host ""
    Write-Host "Access URL:"
    Write-Success "  * Frontend:   http://localhost:$FRONTEND_PORT"
    Write-Host ""
}

# Main logic
switch ($Action) {
    'start' {
        Start-Service
    }
    'stop' {
        Stop-Service
    }
    'restart' {
        Restart-Service
    }
    'status' {
        Show-ServiceStatus
    }
    'help' {
        Show-Help
    }
}
