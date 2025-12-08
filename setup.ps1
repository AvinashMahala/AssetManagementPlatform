<#
One-time Windows setup script for AssetManagementPlatform
Usage:
  - Run interactive (default): powershell -ExecutionPolicy Bypass -File setup.ps1
  - Non-interactive (auto-confirm): powershell -ExecutionPolicy Bypass -File setup.ps1 -NonInteractive

This script will:
  - Check and optionally install Node.js (>=18), Python (>=3.10), Docker Desktop (recommended)
  - Install global tooling (pnpm) optionally
  - Create a Python virtual environment and install Python dependencies for DB seeding
  - Install Node dependencies (npm ci --workspaces)
  - Optionally run `python setup_database.py` to seed DB
  - Optionally open dev servers (start-dev.ps1)
#>

Param(
    [switch] $NonInteractive,
    [switch] $InstallAll,
    [switch] $SeedDB,
    [switch] $StartDev,
    [switch] $SkipDocker,
    [switch] $NoStart
)

function Show-Title([string]$msg) { Write-Host "`n=== $msg ===`n" -ForegroundColor Cyan }
function Info([string]$msg) { Write-Host $msg -ForegroundColor Gray }
function Success([string]$msg) { Write-Host $msg -ForegroundColor Green }
function Warn([string]$msg) { Write-Host $msg -ForegroundColor Yellow }
function Err([string]$msg) { Write-Host $msg -ForegroundColor Red }

# Determine if running as Administrator
function Is-Admin {
    $current = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($current)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptRoot

Show-Title "AssetManagementPlatform - One-time Setup (Windows)"

if (Is-Admin) { Success "Running as Administrator" } else { Warn "Not running as Administrator; some installations will require elevation (please run as Admin or follow manual steps)" }

# Tools to check
$requiredTools = @('git','node','npm','python','docker')

function Check-Command([string]$cmd) {
    return (Get-Command $cmd -ErrorAction SilentlyContinue) -ne $null
}

# Prompt helper (non-interactive respects -NonInteractive)
function Ask([string]$question, [bool]$default = $false) {
    if ($NonInteractive -or $InstallAll) { return $true }

    $defaultChar = if ($default) { 'Y/n' } else { 'y/N' }
    $answer = Read-Host -Prompt "$question [$defaultChar]"
    if ([string]::IsNullOrWhiteSpace($answer)) { return $default }
    return ($answer.Trim().ToLower() -in 'y','yes')
}

# Helper to run winget or choco if available
function Try-Install-WithWinget($id, $name) {
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Info "Installing $name with winget..."
        if ($NonInteractive) { winget install --id $id -e --silent --accept-package-agreements --accept-source-agreements } else { winget install --id $id -e }
        return $?
    }
    return $false
}

function Try-Install-WithChoco($pkg, $name) {
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Info "Installing $name with choco..."
        choco install $pkg -y
        return $?
    }
    return $false
}

# Node.js check
function Check-Node {
    if (Check-Command node) {
        $version = (node --version) -replace '^v', ''
        Info "Node version: $version"
        $major = [int]($version.Split('.')[0])
        if ($major -lt 18) {
            Warn "Node version < 18 detected. Node 18+ is recommended."
            if (Ask('Update Node to LTS (Node 18/20)?')) { Install-Node }
        } else { Success 'Node version ok' }
    } else {
        Warn 'Node not found'
        if (Ask('Install Node LTS?')) { Install-Node }
    }
}

function Install-Node {
    if (Try-Install-WithWinget('OpenJS.NodeJS.LTS','Node.js LTS')) { return }
    if (Try-Install-WithChoco('nodejs-lts','Node.js LTS')) { return }
    Warn "No package manager (winget/choco) found — please install Node.js manually from https://nodejs.org/"
}

# Python check
function Check-Python {
    if (Check-Command python) {
        $version = (python --version 2>$null).Trim()
        Info "Python: $version"
        $ver = $version -replace '[^0-9.]',''
        $major = [int]($ver.Split('.')[0])
        if ($major -lt 3) {
            Warn "Python 3.x is required"
            if (Ask('Install Python3?')) { Install-Python }
        } else { Success 'Python version ok' }
    } else {
        Warn 'Python not found'
        if (Ask('Install Python3?')) { Install-Python }
    }
}

function Install-Python {
    if (Try-Install-WithWinget('Python.Python.3','Python 3')) { return }
    if (Try-Install-WithChoco('python','Python 3')) { return }
    Warn "Manual Python installation required: https://www.python.org/downloads/"
}

# Docker check
function Check-Docker {
    if (Check-Command docker) {
        $out = docker --version 2>$null
        Info "Docker: $out"
        Success 'Docker available' ; return
    }
    Warn 'Docker not found'
    if (Ask('Install Docker Desktop? (Requires reboot and admin)')) { Install-Docker }
}

function Install-Docker {
    if (Try-Install-WithWinget('Docker.DockerDesktop','Docker Desktop')) { return }
    if (Try-Install-WithChoco('docker-desktop','Docker Desktop')) { return }
    Warn "Manual Docker Desktop installation required: https://www.docker.com/get-started"
}

# Git check
function Check-Git {
    if (Check-Command git) { Info "Git: $(git --version)" ; Success 'Git available' ; return }
    Warn 'Git not found'
    if (Ask('Install Git?')) { Try-Install-WithWinget('Git.Git','Git') -or Try-Install-WithChoco('git','Git') }
}

# Node global packages we recommend
function Install-GlobalNodeTools {
    $globalTools = @('pnpm')
    foreach ($tool in $globalTools) {
        if (Check-Command $tool) { Info "$tool globally installed" } else {
            $prompt = 'Install ' + $tool + ' globally (via npm)?'
            if (Ask($prompt)) {
                if (Get-Command yarn -ErrorAction SilentlyContinue) { yarn global add $tool } else { npm install -g $tool }
            }
        }
    }
}

# Install Node dependencies
function Install-NodeDeps {
    Info 'Installing node dependencies in root (prefer yarn)'
    if (Get-Command yarn -ErrorAction SilentlyContinue) { yarn install } else { if (Test-Path package-lock.json) { npm ci } else { npm install } }
}

# Install workspace Node dependencies (NPM workspaces)
function Install-WorkspaceDeps {
    Info 'Installing workspace dependencies (prefer yarn)'
    if (Get-Command yarn -ErrorAction SilentlyContinue) { yarn install } else { npm ci --workspaces --if-present }
}

# Setup Python virtualenv and install python reqs
function Setup-PythonVenv {
    if (-not (Check-Command python)) { Err 'python not found, skipping python package installation' ; return }

    $venvDir = Join-Path $ScriptRoot '.venv'
    if (-not (Test-Path $venvDir)) {
        Info 'Creating python virtual environment (.venv)'
        python -m venv $venvDir
    } else { Info '.venv exists' }

    # Activate and install
    $pip = Join-Path $venvDir 'Scripts\pip.exe'
    if (-not (Test-Path $pip)) { Err 'pip not found in venv' ; return }

    if (Test-Path 'scripts\seeding_requirements.txt') {
        Info 'Installing python requirements for seeding...'
        & $pip install -r scripts\seeding_requirements.txt
    } else { Info 'No python requirements file found' }
}

# Copy env example from backend
function Copy-EnvExamples {
    $backendEnvExample = Join-Path $ScriptRoot 'backend\.env.example'
    $backendEnv = Join-Path $ScriptRoot 'backend\.env'
    if (Test-Path $backendEnvExample -and (-not (Test-Path $backendEnv))) {
        Info 'Copying backend/.env.example to backend/.env'
        Copy-Item $backendEnvExample $backendEnv
    }
    # Root .env not present; if there's root .env.example provide suggestion
    $rootEnvExample = Join-Path $ScriptRoot '.env.example'
    $rootEnv = Join-Path $ScriptRoot '.env'
    if (Test-Path $rootEnvExample -and (-not (Test-Path $rootEnv))) {
        Info 'Copying .env.example to .env'
        Copy-Item $rootEnvExample $rootEnv
    }
}

# Run database seeding (uses setup_database.py)
function Seed-Database {
    if (-not (Check-Command python)) { Err 'Python not available, cannot run database seed' ; return }
    if (-not (Test-Path 'setup_database.py')) { Err 'setup_database.py not found, skipping' ; return }

    if (-not $NonInteractive) {
        if (-not (Ask('Run complete DB setup pipeline now? (This will ask for confirmations inside)'))) { Info 'Skipping DB seed' ; return }
    }

    Info 'Running DB setup pipeline (setup_database.py)'
    python setup_database.py
}

# Start dev servers
function Start-DevServers {
    if (Test-Path 'start-dev.ps1') {
        Info 'Starting dev servers via start-dev.ps1'
        powershell -ExecutionPolicy Bypass -File start-dev.ps1
    } elseif (Test-Path 'start-dev.js') {
        Info 'Starting dev servers via start-dev.js'
        node start-dev.js
    } else { Err 'No start-dev entrypoint found' }
}

# Main entrypoint now delegates to the Node orchestrator for a unified experience
Write-Host "Using Node-based unified setup at scripts/setup.js"
if (-not (Test-Path 'scripts\setup.js')) { Err 'scripts\setup.js not found; fallback to internal powerShell steps (legacy).'; exit 1 }

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Err 'Node not found; please install Node.js or run this script as Administrator with package manager available to install Node.'; exit 1 }

$psArgs = @()
if ($NonInteractive) { $psArgs += '--yes' }
if ($SeedDB) { $psArgs += '--seed-db' }
if ($StartDev) { $psArgs += '--start' }
if ($InstallAll) { $psArgs += '--yes' }
if ($SkipDocker) { $psArgs += '--skip-docker' }
if ($psArgs.Count -eq 0) { $psArgsArg = '' } else { $psArgsArg = $psArgs -join ' ' }
if ($NoStart) { $psArgsArg = $psArgsArg + ' --no-start' }

Write-Host "Running: node scripts/setup.js $psArgsArg"
node scripts/setup.js $psArgsArg

Success 'Setup (Node orchestrator) complete!'

