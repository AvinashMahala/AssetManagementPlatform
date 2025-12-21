#!/usr/bin/env node

/**
 * Platform-agnostic development server starter
 * Opens two separate terminals: one for backend, one for frontend
 */

const { spawn, exec, spawnSync } = require('child_process');
const readline = require('readline');
const path = require('path');

const projectRoot = __dirname;
const cliArgs = process.argv.slice(2);
const SKIP_DOCKER = cliArgs.includes('--skip-docker') || cliArgs.includes('-s');
const backendDir = path.join(projectRoot, 'backend');
const frontendDir = path.join(projectRoot, 'frontend');

function hasCmd(cmd) {
  try { const c = spawnSync(cmd, ['--version'], { shell: true, stdio: 'ignore' }); return c.status === 0; } catch (e) { return false; }
}

// Ensure running Node version is compatible (>=18)
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (!Number.isFinite(nodeMajor) || nodeMajor < 18) {
  console.error(`Node ${nodeMajor} detected — Node 18+ is required to run the dev servers. Please upgrade your Node installation (nvm, nvm-windows, or official installers).
Examples:
  - Windows: winget install -e --id OpenJS.NodeJS.LTS
  - macOS: brew install node@18
  - Linux (nvm recommended): nvm install 18 && nvm use 18
After upgrading, restart this script and re-run yarn install if needed.`);
  process.exit(1);
}

console.log('🚀 Starting Asset Management Platform Development Servers in separate terminals...\n');

function openTerminal(command, cwd, name) {
  const platform = process.platform;

  let terminalCommand;
  let terminalArgs;

  if (platform === 'darwin') {
    // macOS: Use AppleScript to open new Terminal tab and bring to focus
    // Set the tab title using an escape sequence before running command
    terminalCommand = 'osascript';
    terminalArgs = ['-e', `tell app "Terminal"
      activate
      do script "printf '\\033]0;${name}\\007'; cd '${cwd}' && ${command}"
    end tell`];
  } else if (platform === 'win32') {
    // Windows: Use cmd to open new command prompt
    terminalCommand = 'cmd';
    // Provide a proper title for the window; Windows `start` takes title as first quoted argument
    terminalArgs = ['/c', 'start', `${name}`, 'cmd', '/k', `cd /d "${cwd}" && ${command}`];
  } else {
    // Linux/Unix: Try gnome-terminal, fallback to xterm
    const terminalApp = process.env.TERM_PROGRAM || 'gnome-terminal';
    if (terminalApp === 'gnome-terminal') {
      terminalCommand = 'gnome-terminal';
      terminalArgs = ['--', '--title', `${name}`, '--', 'bash', '-c', `cd '${cwd}' && ${command}; exec bash`];
    } else {
      terminalCommand = 'xterm';
      terminalArgs = ['-T', `${name}`, '-e', `bash -lc "cd '${cwd}' && ${command}; exec bash"`];
    }
  }

  console.log(`📱 Opening ${name} terminal...`);
  const terminalProcess = spawn(terminalCommand, terminalArgs, { stdio: 'ignore', detached: true });

  terminalProcess.on('error', (error) => {
    console.error(`❌ Failed to open ${name} terminal:`, error.message);
    console.log(`💡 Please manually run: cd ${cwd} && ${command}`);
  });

  return terminalProcess;
}

// Open backend terminal
const pmIsYarn = hasCmd('yarn');
const backendCommand = pmIsYarn ? 'yarn workspace backend dev' : 'npm run dev --workspace=backend';

function checkPortAndOpen({ port, command, cwd, name, expectedIndicators = [] }) {
  const platform = process.platform;

  // Windows: use netstat + powershell to find pid and commandline
  if (platform === 'win32') {
    exec(`netstat -ano | findstr :${port}`, (err, stdout, stderr) => {
      const output = (stdout || '').trim();
      if (!output) {
        openTerminal(command, cwd, name);
        return;
      }

      // Find a LISTENING line and extract the PID (last token)
      const lines = output.split(/\r?\n/).filter(Boolean);
      const listeningLine = lines.find(l => /LISTENING/i.test(l));
      const procLine = listeningLine || lines[0];
      const parts = procLine.trim().split(/\s+/);
      const foundPid = parts[parts.length - 1] || 'unknown';

      // Use PowerShell to query command line for PID
      exec(`powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \"ProcessId=${foundPid}\").CommandLine"`, (psErr, psOut) => {
        const cmdline = (psOut || '').trim();
        const isOurApp = expectedIndicators.some((ind) => ind && cmdline.includes(ind));
        if (isOurApp) {
          console.log(`✅ ${name} already running (pid ${foundPid}). Skipping open.`);
          return;
        }

        console.log(`⚠️ Port ${port} is in use by process (pid ${foundPid}).`);
        if (cmdline) console.log(`   Command line: ${cmdline}`);

        // Ask user whether they want to stop this process (only if running interactively)
        if (process.stdin && process.stdin.isTTY) {
          const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
          rl.question(`Do you want to stop process ${foundPid} and free port ${port}? (y/N): `, (answer) => {
            rl.close();
            const yn = (answer || '').trim().toLowerCase();
            if (yn === 'y' || yn === 'yes') {
              // Attempt to stop the process on Windows
              console.log(`🛑 Attempting to stop process ${foundPid}...`);
              exec(`taskkill /PID ${foundPid} /F`, (killErr, killStdout, killStderr) => {
                if (killErr) {
                  console.error(`❌ Failed to stop process ${foundPid}:`, (killStderr || killErr.message).trim());
                  console.log(`ℹ️ Please stop it manually (e.g., Task Manager) and re-run this script.`);
                  return;
                }
                console.log(`✅ Successfully stopped process ${foundPid}. Re-running check to open the terminal...`);
                openTerminal(command, cwd, name);
              });
            } else {
              console.log(`ℹ️ Not stopping process ${foundPid}. To start this project, stop it and re-run this script.`);
            }
          });
          return;
        }

        console.log(`ℹ️ To start this project, stop the process above and re-run this script.`);
      });
    });
    return;
  }

  // macOS / Linux: use lsof + ps (fallbacks depends on environment available)
  exec(`lsof -iTCP:${port} -sTCP:LISTEN -n -P`, (err, stdout, stderr) => {
    // On macOS `lsof` returns exit code 1 with empty stdout when nothing is listening.
    const output = (stdout || '').trim();
    if (!output) {
      // Port is free
      openTerminal(command, cwd, name);
      return;
    }

    // Parse the first non-header line from lsof output to get PROCESS and PID
    const lines = output.split(/\r?\n/).filter(Boolean);
    let procLine = lines.find((l) => !/^COMMAND\s+/i.test(l)) || lines[0];
    const parts = procLine.trim().split(/\s+/);
    const foundCommand = parts[0] || 'unknown';
    const foundPid = parts[1] || 'unknown';

    // Inspect full command line for the PID to see if it's our app
    exec(`ps -o command= -p ${foundPid}`, (psErr, psOut, psErrOut) => {
      const cmdline = (psOut || '').trim();
      const isOurApp = expectedIndicators.some((ind) => ind && cmdline.includes(ind));

      if (isOurApp) {
        console.log(`✅ ${name} already running (pid ${foundPid}). Skipping open.`);
        return;
      }

      console.log(`⚠️ Port ${port} is in use by process ${foundCommand} (pid ${foundPid}).`);
      if (cmdline) console.log(`   Command line: ${cmdline}`);

      // Ask user whether they want to stop this process (only if running interactively)
      if (process.stdin && process.stdin.isTTY) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(`Do you want to stop process ${foundPid} and free port ${port}? (y/N): `, (answer) => {
          rl.close();
          const yn = (answer || '').trim().toLowerCase();
          if (yn === 'y' || yn === 'yes') {
            console.log(`🛑 Attempting to stop process ${foundPid}...`);
            exec(`kill -9 ${foundPid}`, (killErr, killStdout, killStderr) => {
              if (killErr) {
                console.error(`❌ Failed to stop process ${foundPid}:`, (killStderr || killErr.message).trim());
                console.log(`ℹ️ Please stop it manually and re-run this script.`);
                return;
              }
              console.log(`✅ Successfully stopped process ${foundPid}. Re-running check to open the terminal...`);
              openTerminal(command, cwd, name);
            });
          } else {
            console.log(`ℹ️ Not stopping process ${foundPid}. To start this project, stop it and re-run this script.`);
          }
        });
        return;
      }

      console.log(`ℹ️ To start this project, stop the process above (for example: 'kill ${foundPid}') and re-run this script.`);
    });
  });
}

checkPortAndOpen({
  port: 5000,
  command: backendCommand,
  cwd: backendDir,
  name: 'Backend',
  expectedIndicators: [backendDir, 'npm run dev', 'ts-node', 'nodemon', 'server.ts', 'node', 'yarn workspace backend dev', 'yarn']
});

// Open frontend terminal
const frontendCommand = pmIsYarn ? 'yarn workspace frontend dev' : 'npm run dev --workspace=frontend';
setTimeout(() => {
  checkPortAndOpen({
    port: 5173,
    command: frontendCommand,
    cwd: frontendDir,
    name: 'Frontend',
    expectedIndicators: [frontendDir, 'vite', 'npm run dev', 'pnpm', 'webpack', 'parcel', 'yarn workspace frontend dev', 'yarn']
  });
}, 1000); // Small delay to prevent overwhelming the system

// Open Docker databases terminal
const dockerCommand = 'docker-compose up';
setTimeout(() => {
  // Check whether any docker-compose services are already running.
  // If none are running, open a terminal and run `docker-compose up`.
  // Try legacy `docker-compose` first, else fallback to `docker compose`
  exec('docker-compose ps --services --filter "status=running"', { cwd: projectRoot }, (err, stdout, stderr) => {
    if (SKIP_DOCKER) { console.log('⚠️ --skip-docker passed; skipping Docker terminal'); return; }
    if (!err) {
      const services = stdout.trim().split(/\r?\n/).filter(Boolean);
      if (services.length > 0) {
        console.log('🐳 Docker services already running:', services.join(', '));
        console.log('✅ Skipping `docker-compose up`.');
      } else {
        openTerminal(dockerCommand, projectRoot, 'Docker DB');
      }
      return;
    }

    // Fallback to `docker compose` if the legacy binary is not available
    exec('docker compose ps --services --filter "status=running"', { cwd: projectRoot }, (err2, stdout2) => {
      if (err2) {
        console.error('❌ Failed to check Docker services:', err2.message);
        console.log(`💡 Please manually run: cd ${projectRoot} && ${dockerCommand}`);
        return;
      }

      const services = stdout2.trim().split(/\r?\n/).filter(Boolean);
      if (services.length > 0) {
        console.log('🐳 Docker services already running:', services.join(', '));
        console.log('✅ Skipping `docker compose up`.');
      } else {
        // If `docker-compose` isn't installed we prefer `docker compose up` as the command we run.
        openTerminal('docker compose up', projectRoot, 'Docker DB');
      }
    });
  });
}, 2000); // Longer delay for Docker

console.log('\n✅ Terminals opened successfully!');
console.log(`📊 Backend terminal: cd ${backendDir} && ${backendCommand} (port 5000)`);
console.log(`🌐 Frontend terminal: cd ${frontendDir} && ${frontendCommand} (port 5173)`);
console.log('🐳 Docker terminal: docker-compose up (PostgreSQL databases)');
console.log('\n💡 If terminals don\'t open, run the commands manually in separate terminals.\n');