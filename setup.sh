#!/usr/bin/env bash
# One-time setup script for macOS/Linux
# This is a lightweight wrapper that calls scripts/setup.js as the single orchestrator
# Usage: bash setup.sh [-y] [-s] [-d] [-n]
#  -y : non-interactive (accept prompts)
#  -s : skip docker
#  -d : seed database after setup

set -euo pipefail
SCRIPT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_ROOT"

YES=0
SEEDDB=0
SKIPDOCKER=0
NOSTART=0

while getopts ":ysd" opt; do
  case $opt in
    y) YES=1 ;;
    s) SKIPDOCKER=1 ;;
    d) SEEDDB=1 ;;
    n) NOSTART=1 ;;
    *) echo "Unknown option: $opt" ; exit 1 ;;
  esac
done

ask() {
  if [ "$YES" -eq 1 ]; then return 0; fi
  read -p "$1 [y/N]: " ans
  case "$ans" in
    [yY]|[yY][eE][sS]) return 0 ;;
    *) return 1 ;;
  esac
}

info() { echo "[INFO] $1"; }
warn() { echo "[WARN] $1"; }
err() { echo "[ERROR] $1"; }

# Check for command
has_cmd() { command -v "$1" >/dev/null 2>&1; }

# Node check
if has_cmd node; then
  info "Node is installed: $(node -v)"
else
  warn "Node is not installed"
  if has_cmd brew; then
    if ask "Install Node via Homebrew?"; then brew install node; fi
  elif has_cmd apt-get; then
    if ask "Install Node via apt?"; then sudo apt-get update && sudo apt-get install -y nodejs npm; fi
  else
    warn "Please install Node.js manually: https://nodejs.org/en/download/"
  fi
fi

# Python check
if has_cmd python3; then
  info "Python is installed: $(python3 --version)"
else
  warn "Python not found"
  if has_cmd brew; then
    if ask "Install Python via Homebrew?"; then brew install python; fi
  elif has_cmd apt-get; then
    if ask "Install Python via apt?"; then sudo apt-get update && sudo apt-get install -y python3 python3-venv python3-pip; fi
  else
    warn "Please install Python manually"
  fi
fi

# Docker check
if has_cmd docker; then
  info "Docker is installed: $(docker --version)"
else
  warn "Docker not found - recommended to install Docker Desktop / Engine"
  if has_cmd brew; then
    if ask "Install Docker via Homebrew?"; then brew install --cask docker; fi
  elif has_cmd apt-get; then
    if ask "Install Docker Engine via apt?"; then sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin; fi
  else
    warn "Please install Docker manually"
  fi
fi

# Git
if has_cmd git; then info "Git: $(git --version)"; else warn "Git not found"; fi

# workspace install (prefer yarn)
if ask "Install Node dependencies (root/workspaces) now?"; then
  if has_cmd yarn || [ -f yarn.lock ]; then
    yarn install
  else
    if [ -f package-lock.json ]; then npm ci ; else npm install ; fi
    # workspace specific: npm ci --workspaces
    npm ci --workspaces --if-present || true
  fi
fi

# Python venv and install requirements
if [ -f "scripts/seeding_requirements.txt" ]; then
  if ask "Create Python venv .venv and install seeding requirements?"; then
    python3 -m venv .venv
    . .venv/bin/activate
    pip install -U pip
    pip install -r scripts/seeding_requirements.txt
    deactivate
  fi
fi

# Copy env examples
if [ -f backend/.env.example ] && [ ! -f backend/.env ]; then
  info "Copying backend/.env.example to backend/.env"
  cp backend/.env.example backend/.env
fi

# Optional: DB seeding
if [ $SEEDDB -eq 1 ]; then
  if [ -f setup_database.py ]; then
    python3 setup_database.py
  else
    warn "setup_database.py not found; skipping";
  fi
fi

if has_cmd node; then
  info 'Invoking unified setup: node scripts/setup.js'
  node scripts/setup.js $( [ "$YES" -eq 1 ] && echo '--yes' || echo '' ) $( [ "$SEEDDB" -eq 1 ] && echo '--seed-db' || echo '' ) $( [ "$SKIPDOCKER" -eq 1 ] && echo '--skip-docker' || echo '' ) $( [ "$NOSTART" -eq 1 ] && echo '--no-start' || echo '' )
else
  warn 'Node is not installed, but this setup wrapper requires Node - please run the script content directly or install node and re-run.'
fi

info "Setup wrapper complete"
