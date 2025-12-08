# One-time Setup (AssetManagementPlatform)

This document explains the one-time setup for development workstations.

## Overview

The repo contains two helper scripts that will check for the most common developer dependencies and help you install or configure them:

- `setup.ps1` (Windows, PowerShell) — uses `winget`/`choco` if present, and guides you to install Node.js, Docker and Python. Accepts flags to run non-interactively.
- `setup.sh` (macOS / Linux) — uses `brew` / `apt` if available and prompts for installation.

Both scripts also:
- Install Node dependencies (`npm ci`/`npm install` and `npm ci --workspaces`) for workspaces.
- Create a Python virtualenv in `.venv` and install DB seeding requirements from `scripts/seeding_requirements.txt`.
- Optionally run the DB seed pipeline and start dev servers.

## Unified Node-based setup (recommended)

Use the cross-platform orchestrator if you prefer a single entrypoint that acts the same on Windows, macOS, and Linux:

```bash
node scripts/setup.js --yes           # run non-interactively and accept prompts
node scripts/setup.js --seed-db       # run and seed database
node scripts/setup.js --skip-docker   # skip starting docker services
```

This unified script attempts installs using common package managers (winget/choco on Windows; brew on macOS; apt on Debian/Ubuntu), but it still may prompt for elevation if a system package needs installing.

### Troubleshooting: Node/Python Version Issues

- If you see the error "The engine \"node\" is incompatible with this module" or similar: ensure Node.js 18+ is installed.
	- Windows (PowerShell):
		- winget install -e --id OpenJS.NodeJS.LTS
		- Or install nvm-windows: https://github.com/coreybutler/nvm-windows and use `nvm install 18; nvm use 18`
	- macOS:
		- brew install node@18
	- Linux/WSL:
		- Use nvm: https://github.com/nvm-sh/nvm
		- Install: `nvm install 18; nvm use 18`

- For Python missing errors when DB seeding is requested:
	- Windows: `winget install -e --id Python.Python.3` or install from https://www.python.org
	- macOS: `brew install python`
	- Linux/WSL: `sudo apt-get update && sudo apt-get install -y python3 python3-pip python3-venv`

After installing Node and/or Python, re-run `node scripts/setup.js` or `yarn setup` to continue.

## Quick commands

Windows (PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
# or via yarn
yarn setup:win
```

macOS/Linux:
```bash
bash setup.sh
# or via yarn
yarn setup:unix
```

Cross-platform convenience (tries Windows first, then Unix):
```bash
yarn setup
```

By default, scripts run interactively. To run non-interactively on Windows:
```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1 -NonInteractive
```

## What the scripts do (summary)
- Validate core dev tools: Node, npm, Git, Docker, Python
- Install Node dependencies for the monorepo
- Create Python virtualenv and install seeding requirements
- Copy `.env.example` to `.env` where applicable
- Optionally seed DB and start dev servers

## Notes
- Some actions require administrator privileges (for installing system packages). For Windows, use `Run as administrator` for PowerShell or enable `winget` or `choco` and rerun the script as admin.
- Docker Desktop on Windows requires WSL2 integration (if using the WSL environment)
- If your workspace uses different package managers (pnpm, yarn), setup script supports installing `pnpm` as a convenience tool.

## Support
If the script fails on your system, manually verify the following tools exist or install them from their respective official sources:
- Node.js: https://nodejs.org/
- Docker: https://www.docker.com/
- Python 3: https://www.python.org/

After running setup, proceed to run the development servers:
- Windows: `yarn start-dev:win` (or `powershell -ExecutionPolicy Bypass -File start-dev.ps1`)
- Unix: `node start-dev.js` or `yarn start-dev`

Happy developing!
