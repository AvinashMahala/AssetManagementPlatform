#!/usr/bin/env node
/*
 Cross-platform setup orchestrator
 Usage: node scripts/setup.js [--yes|-y] [--seed|--seed-db] [--skip-docker]
 
 This script performs the following steps (improved):
 1. Check for required tools (node, npm, python, docker, git). If a tool is missing, attempt to install using OS package managers.
 2. Check required dependencies (typescript, pnpm, tsx/ts-node if needed) and install missing ones.
 3. Optionally run DB seeding if --seed-db is provided.
 4. Start dev servers (backend, frontend, docker) via start-dev.js which opens separate terminals.
 
 The script implements a retry loop for installations (2 retries), and falls back to suggesting manual install if automatic install fails.
*/

const { exec, spawnSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

const args = process.argv.slice(2);
const readline = require('readline');
const YES = args.includes('--yes') || args.includes('-y') || args.includes('--non-interactive');
const SEED = args.includes('--seed') || args.includes('--seed-db') || args.includes('-d');
const SKIP_DOCKER = args.includes('--skip-docker') || args.includes('-s');
const START = args.includes('--start') || !args.includes('--no-start');

const MAX_RETRIES = 2;
const REQUIRED_NODE_MAJOR = 18; // minimum Node major to run this project

const info = (m) => console.log('[INFO]', m);
const warn = (m) => console.warn('[WARN]', m);
const err = (m) => console.error('[ERROR]', m);

function run(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { stdio: 'inherit', ...opts }, (error, stdout, stderr) => {
      if (error) return reject({ error, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

function runSync(cmd, opts = {}) {
  return spawnSync(cmd, { shell: true, stdio: 'inherit', ...opts });
}

async function hasCmd(cmd) {
  const platform = process.platform;
  const check = platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`;
  try {
    await run(check);
    return true;
  } catch (e) {
    return false;
  }
}

async function getVersion(cmd, args = ['--version']) {
  return new Promise((resolve) => {
    const c = spawnSync([cmd].concat(args).join(' '), { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
    if (c && c.status === 0 && c.stdout) {
      resolve(c.stdout.toString().trim());
    } else {
      resolve(null);
    }
  });
}

async function tryInstallWithOSPackageManager(cmds, name) {
  // cmds is an array of command strings to try in sequence
  for (const c of cmds) {
    try {
      info(`Attempting to install ${name} via: ${c}`);
      const res = runSync(c);
      if (res && res.status === 0) { info(`${name} installed (via ${c})`); return true; }
    } catch (e) {
      warn(`Failed to run ${c}: ${e}`);
    }
  }
  return false;
}

async function installToolWithRetry(installCmds, name, predicateCmd = null) {
  // Checks success via predicateCmd afterwards, else checks hasCmd
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    if (predicateCmd) {
      try {
        await run(predicateCmd);
        info(`${name} detected`);
        return true;
      } catch (e) {
        // not installed
      }
    } else {
      const present = await hasCmd(name);
      if (present) { info(`${name} is present`); return true; }
    }

    if (attempts === MAX_RETRIES) break;

    if (YES) {
      info(`${name} missing — attempting install automatically (attempt ${attempts + 1}/${MAX_RETRIES})`);
    } else {
      const ans = await new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(`${name} not found. Attempt to install now? [y/N]: `, (answer) => { rl.close(); resolve(answer); });
      });
      if (!/^y(es)?$/i.test(ans)) { warn(`Skipping automatic install for ${name}`); break; }
    }

    attempts++;
    const ok = await tryInstallWithOSPackageManager(installCmds, name);
      if (!ok) {
      warn(`Automatic install attempt failed for ${name}.`);
      if (!YES) {
        const retry = await new Promise((resolve) => {
          const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
          rl.question('Retry install? [y/N]: ', (answer) => { rl.close(); resolve(answer); });
        });
        if (!/^y(es)?$/i.test(retry)) break;
      }
    } else {
      // success; ensure it's detected
      continue;
    }
  }

  // After attempts exhausted, final validation
  if (predicateCmd) {
    try { await run(predicateCmd); return true; } catch (e) { warn(`${name} still not detected after retries`); return false; }
  } else {
    const present = await hasCmd(name); if (!present) warn(`${name} still not detected after retries`); return present;
  }
}

async function checkAndInstallTools() {
  info('Checking for required tools...');

  // Node and npm (validate version early and fail fast)
  const nodePresent = await hasCmd('node');
  if (!nodePresent) {
    const cmds = [];
    if (process.platform === 'win32') cmds.push('winget install -e --id OpenJS.NodeJS.LTS');
    if (process.platform === 'darwin') cmds.push('brew install node');
    if (process.platform === 'linux') cmds.push('sudo apt-get update && sudo apt-get install -y nodejs npm');
    const ok = await installToolWithRetry(cmds, 'node', 'node --version');
    if (!ok) warn('Please install Node.js manually: https://nodejs.org');
  } else info(`Node: ${spawnSync('node -v', { shell:true }).stdout ? spawnSync('node -v', { shell:true }).stdout.toString() : ''}`);
  // If Node present, check version
  if (nodePresent) {
    const out = await getVersion('node', ['--version']);
    if (out) {
      const m = out.replace(/^v/, '').split('.')[0];
      const major = parseInt(m, 10);
      if (Number.isFinite(major) && major < REQUIRED_NODE_MAJOR) {
        warn(`Detected Node major version ${major}. Node ${REQUIRED_NODE_MAJOR}+ is required.`);
        if (YES) {
          info('Attempting to upgrade Node automatically (will require admin privileges).');
        } else {
          // Interactive prompt to upgrade
          const upgradeAnswer = await new Promise((resolve) => {
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            rl.question(`Node ${REQUIRED_NODE_MAJOR}+ is required. Upgrade now? [y/N]: `, (answer) => { rl.close(); resolve(answer); });
          });
          if (!/^y(es)?$/i.test(upgradeAnswer)) {
            err(`Node ${REQUIRED_NODE_MAJOR}+ is required to continue. Please upgrade Node.js and re-run this script.`);
            // Provide helpful commands for the user
            if (process.platform === 'win32') {
              console.log('\n⚠️ On Windows you can run:');
              console.log('  winget install -e --id OpenJS.NodeJS.LTS');
              console.log('  OR install nvm-windows: https://github.com/coreybutler/nvm-windows and then:');
              console.log('    nvm install 18; nvm use 18');
            } else if (process.platform === 'darwin') {
              console.log('\n⚠️ On macOS you can run:');
              console.log('  brew install node@18');
            } else {
              console.log('\n⚠️ On Debian/Ubuntu you can run:');
              console.log('  sudo apt-get update && sudo apt-get install -y nodejs npm');
              console.log('  # Or use nvm: https://github.com/nvm-sh/nvm');
              console.log('  nvm install 18; nvm use 18');
            }
            process.exit(2);
          }
        }
        // If interactive or YES, try an automatic install using package manager
        const cmds = [];
        if (process.platform === 'win32') cmds.push('winget install -e --id OpenJS.NodeJS.LTS');
        if (process.platform === 'darwin') cmds.push('brew upgrade node || brew install node');
        if (process.platform === 'linux') cmds.push('sudo apt-get update && sudo apt-get install -y nodejs npm');
        await installToolWithRetry(cmds, 'node', 'node --version');
        // Re-check version
        const outAfter = await getVersion('node');
        const majorAfter = outAfter ? parseInt(outAfter.replace(/^v/, '').split('.')[0], 10) : NaN;
        if (!Number.isFinite(majorAfter) || majorAfter < REQUIRED_NODE_MAJOR) {
          err('Node upgrade did not succeed or Node version is still incompatible. Please upgrade Node manually and re-run this script.');
          process.exit(3);
        }
      }
    }
  }

  // yarn: prefer to use yarn for project installs; if not present, fall back to npm
  const yarnPresent = await hasCmd('yarn');
  if (!yarnPresent) {
    warn('yarn not found; will use npm if available. You can install yarn for a yarn-first workflow.');
  } else {
    const yv = await getVersion('yarn');
    if (yv) {
      const major = parseInt(yv.split('.')[0], 10);
      if (!Number.isFinite(major) || major < 1) {
        warn(`yarn version ${yv} detected; Yarn 1.22+ or modern Yarn is recommended.`);
        if (YES || (await new Promise((resolve) => {
          const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
          rl.question('Update Yarn to the latest stable version? [y/N]: ', (answer) => { rl.close(); resolve(answer); });
        })).match(/^y/i)) {
          const cmds = [];
          if (process.platform === 'win32') cmds.push('winget install -e --id Yarn.Yarn');
          if (process.platform === 'darwin') cmds.push('brew install yarn');
          if (process.platform === 'linux') cmds.push('npm install -g yarn');
          await installToolWithRetry(cmds, 'yarn', 'yarn --version');
        }
      }
    }
  }

  // Docker
  const dockerPresent = await hasCmd('docker');
  if (!dockerPresent) {
    const cmds = [];
    if (process.platform === 'win32') cmds.push('winget install -e --id Docker.DockerDesktop');
    if (process.platform === 'darwin') cmds.push('brew install --cask docker');
    if (process.platform === 'linux') cmds.push('sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin');
    const ok = await installToolWithRetry(cmds, 'docker', 'docker --version');
    if (!ok) warn('Please install Docker manually: https://www.docker.com/get-started');
  }

  // python
  const py = await hasCmd('python3') || await hasCmd('python');
  if (!py) {
    const cmds = [];
    if (process.platform === 'win32') cmds.push('winget install -e --id Python.Python.3');
    if (process.platform === 'darwin') cmds.push('brew install python');
    if (process.platform === 'linux') cmds.push('sudo apt-get update && sudo apt-get install -y python3 python3-venv python3-pip');
    const ok = await installToolWithRetry(cmds, 'python', 'python3 --version || python --version');
    if (!ok) warn('Please install Python 3 manually: https://www.python.org');
  }

  // git
  const gitpresent = await hasCmd('git');
  if (!gitpresent) {
    const cmds = [];
    if (process.platform === 'win32') cmds.push('winget install -e --id Git.Git');
    if (process.platform === 'darwin') cmds.push('brew install git');
    if (process.platform === 'linux') cmds.push('sudo apt-get update && sudo apt-get install -y git');
    const ok = await installToolWithRetry(cmds, 'git', 'git --version');
    if (!ok) warn('Please install git manually');
  }

  // Final quick note
  info('Tool check phase complete');
}

async function checkAndInstallDependencies() {
  info('Checking for important global dev dependencies and project dependencies...');

  // Check for pnpm
  const pnpmPresent = await hasCmd('pnpm');
  if (!pnpmPresent) {
    if (YES || (await new Promise((resolve) => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question('pnpm not found. Install pnpm globally (yarn global add pnpm | npm install -g pnpm)? [y/N]: ', (answer) => { rl.close(); resolve(answer); });
    })).match(/^y/i)) {
      try {
        if (await hasCmd('yarn')) { runSync('yarn global add pnpm'); }
        else { runSync('npm install -g pnpm'); }
        info('pnpm installed (global)');
      }
      catch (e) { warn('Failed to install pnpm globally.'); }
    }
  } else info('pnpm is present');

  // Typescript global check (optional). TypeScript is a project devDependency; we will still verify' +
  'n that local nodes exist before failing.';
  const tscLocalBackend = existsSync(path.join(projectRoot, 'backend', 'node_modules', '.bin', 'tsc'));
  const tscLocalFrontend = existsSync(path.join(projectRoot, 'frontend', 'node_modules', '.bin', 'tsc'));
  if (!tscLocalBackend && !tscLocalFrontend) {
    warn('TypeScript not installed in backend or frontend node_modules. Running top-level install to add missing packages.');
    try {
      if (await hasCmd('yarn')) { runSync('yarn install'); } else { runSync('npm ci'); runSync('npm ci --workspaces --if-present'); }
      info('Project dependencies installed');
    } catch (e) { warn('Failed to run project package install'); }
  }

  // If tsc still not found, optionally offer to install globally
  const tscPresent = await hasCmd('tsc');
  if (!tscPresent) {
    if (YES) {
      try { if (await hasCmd('yarn')) { runSync('yarn global add typescript'); } else { runSync('npm install -g typescript'); } info('typescript installed globally'); }
      catch (e) { warn('Failed to install typescript globally'); }
    } else {
      const installTSC = await new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question('tsc (TypeScript compiler) not found globally. Install globally (npm install -g typescript)? [y/N]: ', (answer) => { rl.close(); resolve(answer); });
      });
      if (/^y(es)?$/i.test(installTSC)) { try { if (await hasCmd('yarn')) { runSync('yarn global add typescript'); } else { runSync('npm install -g typescript'); } info('typescript installed globally'); } catch (e) { warn('Failed to install typescript globally'); } }
    }
  }

  // Ensure workspace dependencies installed
  try { if (await hasCmd('yarn')) { runSync('yarn install'); } else { runSync('npm ci --workspaces --if-present'); } } catch (e) { warn('Failed to run workspace install.'); }

  info('Dependency check phase complete');
}

async function setupPythonVenv() {
  // Install python packages for seeding
  const pythonCmd = (await hasCmd('python3')) ? 'python3' : 'python';
  if (!pythonCmd) {
    warn('Python not found; skipping python venv setup');
    if (SEED) {
      err('DB seeding was requested but Python was not found. Please install Python 3+ and re-run this script.');
      if (process.platform === 'win32') {
        console.log('  Suggestion: winget install -e --id Python.Python.3');
      } else if (process.platform === 'darwin') {
        console.log('  Suggestion: brew install python');
      } else {
        console.log('  Suggestion: sudo apt-get update && sudo apt-get install -y python3 python3-venv python3-pip');
      }
      process.exit(10);
    }
    return;
  }
  const venvPath = path.join(projectRoot, '.venv');
  if (!existsSync(venvPath)) {
    info('Creating python virtual environment');
    try { runSync(`${pythonCmd} -m venv .venv`); }
    catch (e) { warn('Failed to create python venv.'); }
  }
  const pipPath = process.platform === 'win32' ? path.join(venvPath, 'Scripts', 'pip.exe') : path.join(venvPath, 'bin', 'pip');
  if (existsSync(path.join(projectRoot, 'scripts', 'seeding_requirements.txt'))) {
    try { runSync(`${pipPath} install -U pip`); runSync(`${pipPath} install -r scripts/seeding_requirements.txt`); }
    catch (e) { warn('Failed to install python seeding requirements'); }
  } else info('No python seeding requirements found');
}

async function runSeedingIfRequested() {
  if (!SEED) return;
  if (existsSync(path.join(projectRoot, 'setup_database.py'))) {
    info('Running DB seeding via setup_database.py');
    const pythonCmd = (await hasCmd('python3')) ? 'python3' : 'python';
    if (!pythonCmd) { warn('Python not available; cannot run DB seed'); return; }
    try { runSync(`${pythonCmd} setup_database.py`); } catch (e) { warn('DB seeding failed.'); }
  } else warn('setup_database.py not found; skipping DB seed');
}

async function startDevServers() {
  if (SKIP_DOCKER) info('Skipping Docker startup per flag');
  info('Starting dev servers (via start-dev.js) ...');
  if (existsSync(path.join(projectRoot, 'start-dev.js'))) {
    try { runSync(`node start-dev.js ${SKIP_DOCKER ? '--skip-docker' : ''}`); }
    catch (e) { warn('Failed to start dev servers via start-dev.js.'); }
  } else if (existsSync(path.join(projectRoot, 'start-dev.ps1')) && process.platform === 'win32') {
    // On Windows run the PowerShell script
    try { runSync('powershell -ExecutionPolicy Bypass -File start-dev.ps1'); }
    catch (e) { warn('Failed to start dev servers via start-dev.ps1.'); }
  } else {
    warn('No start-dev entrypoint found.');
  }
}

async function main() {
  await checkAndInstallTools();
  await checkAndInstallDependencies();
  await setupPythonVenv();
  await runSeedingIfRequested();
  if (START) await startDevServers(); else info('Skipping starting dev servers (start flag not provided)');
  info('Setup complete!');
}

main().catch((e) => { err('Setup script failed: ' + (e && e.error ? e.error.message : e)); process.exit(1); });
