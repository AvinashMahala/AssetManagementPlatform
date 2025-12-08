<#
PowerShell script to start frontend, backend, and Docker databases in separate PowerShell windows on Windows.
Usage: Right-click -> Run with PowerShell or run `powershell -ExecutionPolicy Bypass -File start-dev.ps1`.
#>

Param(
    [switch] $SkipDocker,
    [switch] $SkipFrontend,
    [switch] $SkipBackend
)

function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host $msg -ForegroundColor Green }
function Write-Warn($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-ErrorMsg($msg) { Write-Host $msg -ForegroundColor Red }

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = $ScriptRoot
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

Write-Info "Starting Asset Management Platform development servers (Windows PowerShell)...`n"

function Open-PowerShellWindow([string]$cwd, [string]$command, [string]$title) {
    # Build the command string that will run inside the new PowerShell window
    $commandString = "cd `"$cwd`"; $command"
    # Use Start-Process to open a new PowerShell window and keep it open after the command runs
    # Use -NoProfile -NoExit -Command to prevent the child process from closing
    Write-Info "Opening $title PowerShell window..."
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -NoExit -Command $commandString" -WindowStyle Normal
}

function Get-PortProcessInfo([int]$port) {
    # Returns a [PSCustomObject] with PID and CommandLine if found, otherwise $null
    try {
        # Get-NetTCPConnection exists in PS 5.1+ on modern Windows
        $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $conn) { return $null }
        $pid = $conn.OwningProcess
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pid" -ErrorAction SilentlyContinue
        $cmd = if ($proc -and $proc.CommandLine) { $proc.CommandLine } else { "" }
        return [PSCustomObject]@{ Pid = $pid; CommandLine = $cmd }
    } catch {
        # Fallback: use netstat + findstr if Get-NetTCPConnection isn't available
        try {
            $raw = netstat -ano | findstr ":$port" 2>$null
            if (-not $raw) { return $null }
            $line = $raw -split "\r?\n" | Where-Object { $_ -match "LISTENING" } | Select-Object -First 1
            if (-not $line) { $line = ($raw -split "\r?\n")[0] }
            $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
            $pid = $parts[-1]
            $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pid" -ErrorAction SilentlyContinue
            $cmd = if ($proc -and $proc.CommandLine) { $proc.CommandLine } else { "" }
            return [PSCustomObject]@{ Pid = $pid; CommandLine = $cmd }
        } catch {
            return $null
        }
    }
}

function Check-PortAndOpen([int]$port, [string]$cwd, [string]$command, [string]$name, [string[]]$expectedIndicators = @()) {
    $info = Get-PortProcessInfo -port $port
    if (-not $info) {
        Open-PowerShellWindow $cwd $command $name
        return
    }

    $pid = $info.Pid
    $cmdline = $info.CommandLine
    $isOur = $false
    foreach ($ind in $expectedIndicators) { if ($ind -and ($cmdline -like "*$ind*")) { $isOur = $true; break } }

    if ($isOur) {
            Write-Success "$name already running (pid $pid). Skipping open."
        return
    }

    Write-Warn "Port $port is in use by pid $pid. Command line: $cmdline"
    if (-not $cmdline) { Write-Info "If you still want to start $name, stop that process or run the command manually: cd $cwd && $command" }
}

# Backend
$yarn = Get-Command yarn -ErrorAction SilentlyContinue
$backendCommand = if ($yarn) { "yarn workspace backend dev" } else { "npm run dev" }
if (-not $SkipBackend) {
    Check-PortAndOpen -port 5000 -cwd $BackendDir -command $backendCommand -name 'Backend' -expectedIndicators @($BackendDir, 'npm run dev', 'ts-node', 'nodemon', 'server.ts', 'node', 'yarn workspace backend dev', 'yarn')
}

# Frontend
$frontendCommand = if ($yarn) { "yarn workspace frontend dev" } else { "npm run dev" }
if (-not $SkipFrontend) {
    # Small delay to avoid contention
    Start-Sleep -Seconds 1
    Check-PortAndOpen -port 5173 -cwd $FrontendDir -command $frontendCommand -name 'Frontend' -expectedIndicators @($FrontendDir, 'vite', 'npm run dev', 'pnpm', 'webpack', 'parcel', 'yarn workspace frontend dev', 'yarn')
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
