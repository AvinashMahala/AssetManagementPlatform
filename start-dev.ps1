<#
PowerShell script to start frontend, backend, and Docker databases.
Added: -Clean switch to purge node_modules and re-install.
#>

# First Time Setup : powershell -ExecutionPolicy Bypass -File .\start-dev.ps1 -Clean
# Remaining always : powershell -ExecutionPolicy Bypass -File .\start-dev.ps1



Param(
    [switch] $SkipDocker,
    [switch] $SkipFrontend,
    [switch] $SkipBackend,
    [switch] $Clean # New Clean Switch
)

function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host $msg -ForegroundColor Green }
function Write-Warn($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-ErrorMsg($msg) { Write-Host $msg -ForegroundColor Red }

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BackendDir = Join-Path $ScriptRoot "backend"
$FrontendDir = Join-Path $ScriptRoot "frontend"

# --- CLEANUP LOGIC ---
if ($Clean) {
    Write-Warn "🧹 Clean mode activated. Purging dependencies and cache..."
    
    $TargetDirs = @($BackendDir, $FrontendDir)
    
    foreach ($dir in $TargetDirs) {
        if (Test-Path $dir) {
            Write-Info "Cleaning $dir..."
            # Remove node_modules and lock files
            Remove-Item -Path (Join-Path $dir "node_modules") -Recurse -Force -ErrorAction SilentlyContinue
            Remove-Item -Path (Join-Path $dir "yarn.lock") -Force -ErrorAction SilentlyContinue
            Remove-Item -Path (Join-Path $dir "package-lock.json") -Force -ErrorAction SilentlyContinue
        }
    }

    # Clear Caches
    Write-Info "Clearing package manager caches..."
    if (Get-Command yarn -ErrorAction SilentlyContinue) { 
        yarn cache clean --force 
    }
    npm cache clean --force

    # Re-installing
    Write-Info "Performing fresh installation..."
    foreach ($dir in $TargetDirs) {
        if (Test-Path $dir) {
            Set-Location $dir
            Write-Info "Installing dependencies in $dir..."
            if (Get-Command yarn -ErrorAction SilentlyContinue) { yarn install } else { npm install }
        }
    }
    Set-Location $ScriptRoot
    Write-Success "✨ Cleanup and Re-install complete.`n"
}
# --- END CLEANUP LOGIC ---

function Open-PowerShellWindow([string]$cwd, [string]$command, [string]$title) {
    $commandString = "cd `"$cwd`"; $command"
    Write-Info "Opening $title PowerShell window..."
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -NoExit -Command $commandString" -WindowStyle Normal
}

function Get-PortProcessInfo([int]$port) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $conn) { return $null }
        $pid = $conn.OwningProcess
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pid" -ErrorAction SilentlyContinue
        $cmd = if ($proc -and $proc.CommandLine) { $proc.CommandLine } else { "" }
        return [PSCustomObject]@{ Pid = $pid; CommandLine = $cmd }
    } catch { return $null }
}

function Check-PortAndOpen([int]$port, [string]$cwd, [string]$command, [string]$name, [string[]]$expectedIndicators = @()) {
    $info = Get-PortProcessInfo -port $port
    if ($info) {
        $pid = $info.Pid
        # If cleaning, we kill the old process to ensure fresh start
        if ($Clean) {
            Write-Warn "Stopping existing $name process (PID $pid) for clean start..."
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        } else {
            Write-Success "$name already running (pid $pid). Skipping open."
            return
        }
    }
    Open-PowerShellWindow $cwd $command $name
}

# Execution Logic
$yarn = Get-Command yarn -ErrorAction SilentlyContinue
$backendCommand = if ($yarn) { "yarn workspace backend dev" } else { "npm run dev" }
$frontendCommand = if ($yarn) { "yarn workspace frontend dev" } else { "npm run dev" }

if (-not $SkipBackend) {
    Check-PortAndOpen -port 5000 -cwd $BackendDir -command $backendCommand -name 'Backend' -expectedIndicators @('node', 'server.ts')
}

if (-not $SkipFrontend) {
    Start-Sleep -Seconds 1
    Check-PortAndOpen -port 5173 -cwd $FrontendDir -command $frontendCommand -name 'Frontend' -expectedIndicators @('vite')
}

# Docker databases
if (-not $SkipDocker) {
    Start-Sleep -Seconds 2

    function Open-DockerCompose() {
        if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
            Open-PowerShellWindow $ProjectRoot "docker-compose up" "Docker DB"
            return
        }
        if (Get-Command docker -ErrorAction SilentlyContinue) {
            Open-PowerShellWindow $ProjectRoot "docker compose up" "Docker DB"
            return
        }
        Write-ErrorMsg "❌ Docker not found in PATH. Please install Docker or run the DBs manually."
    }

    # Check docker-compose or docker compose running
    $servicesRunning = $false
    try {
        if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
            $out = docker-compose ps --services --filter "status=running" 2>$null
            if ($out -and $out.Trim().Length -gt 0) { $servicesRunning = $true }
        } elseif (Get-Command docker -ErrorAction SilentlyContinue) {
            $out = docker compose ps --services --filter "status=running" 2>$null
            if ($out -and $out.Trim().Length -gt 0) { $servicesRunning = $true }
        }
    } catch {
        $null
    }

    if ($servicesRunning) {
            Write-Success "Docker services already running. Skipping docker compose up."
    } else {
        Open-DockerCompose
    }
}

Write-Success "`nTasks started. If windows don't open, run commands manually in separate terminals:`n  Backend: cd $BackendDir && $backendCommand`n  Frontend: cd $FrontendDir && $frontendCommand`n  Docker: docker-compose up (or docker compose up)"
