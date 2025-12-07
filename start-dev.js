#!/usr/bin/env node

/**
 * Platform-agnostic development server starter
 * Opens two separate terminals: one for backend, one for frontend
 */

const { spawn, exec } = require('child_process');
const path = require('path');

const projectRoot = __dirname;
const backendDir = path.join(projectRoot, 'backend');
const frontendDir = path.join(projectRoot, 'frontend');

console.log('🚀 Starting Asset Management Platform Development Servers in separate terminals...\n');

function openTerminal(command, cwd, name) {
  const platform = process.platform;

  let terminalCommand;
  let terminalArgs;

  if (platform === 'darwin') {
    // macOS: Use AppleScript to open new Terminal tab and bring to focus
    terminalCommand = 'osascript';
    terminalArgs = ['-e', `tell app "Terminal"
      activate
      do script "cd '${cwd}' && ${command}"
    end tell`];
  } else if (platform === 'win32') {
    // Windows: Use cmd to open new command prompt
    terminalCommand = 'cmd';
    terminalArgs = ['/c', 'start', 'cmd', '/k', `cd /d "${cwd}" && ${command}`];
  } else {
    // Linux/Unix: Try gnome-terminal, fallback to xterm
    const terminalApp = process.env.TERM_PROGRAM || 'gnome-terminal';
    if (terminalApp === 'gnome-terminal') {
      terminalCommand = 'gnome-terminal';
      terminalArgs = ['--', 'bash', '-c', `cd '${cwd}' && ${command}; exec bash`];
    } else {
      terminalCommand = 'xterm';
      terminalArgs = ['-e', `cd '${cwd}' && ${command}; bash`];
    }
  }

  console.log(`📱 Opening ${name} terminal...`);
  const terminalProcess = spawn(terminalCommand, terminalArgs, { stdio: 'ignore' });

  terminalProcess.on('error', (error) => {
    console.error(`❌ Failed to open ${name} terminal:`, error.message);
    console.log(`💡 Please manually run: cd ${cwd} && ${command}`);
  });

  return terminalProcess;
}

// Open backend terminal
const backendCommand = 'npm run dev';

function checkPortAndOpen({ port, command, cwd, name, expectedIndicators = [] }) {
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
      console.log(`ℹ️ To start this project, stop the process above (for example: \`kill ${foundPid}\`) and re-run this script.`);
    });
  });
}

checkPortAndOpen({
  port: 5000,
  command: backendCommand,
  cwd: backendDir,
  name: 'Backend',
  expectedIndicators: [backendDir, 'npm run dev', 'ts-node', 'nodemon', 'server.ts', 'node']
});

// Open frontend terminal
const frontendCommand = 'npm run dev';
setTimeout(() => {
  checkPortAndOpen({
    port: 5173,
    command: frontendCommand,
    cwd: frontendDir,
    name: 'Frontend',
    expectedIndicators: [frontendDir, 'vite', 'npm run dev', 'pnpm', 'webpack', 'parcel']
  });
}, 1000); // Small delay to prevent overwhelming the system

// Open Docker databases terminal
const dockerCommand = 'docker-compose up';
setTimeout(() => {
  // Check whether any docker-compose services are already running.
  // If none are running, open a terminal and run `docker-compose up`.
  exec('docker-compose ps --services --filter "status=running"', { cwd: projectRoot }, (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Failed to check Docker services:', err.message);
      console.log(`💡 Please manually run: cd ${projectRoot} && ${dockerCommand}`);
      return;
    }

    const services = stdout.trim().split(/\r?\n/).filter(Boolean);
    if (services.length > 0) {
      console.log('🐳 Docker services already running:', services.join(', '));
      console.log('✅ Skipping `docker-compose up`.');
    } else {
      openTerminal(dockerCommand, projectRoot, 'Docker DB');
    }
  });
}, 2000); // Longer delay for Docker

console.log('\n✅ Terminals opened successfully!');
console.log('📊 Backend terminal: cd backend && npm run dev (port 5000)');
console.log('🌐 Frontend terminal: cd frontend && npm run dev (port 5173)');
console.log('🐳 Docker terminal: docker-compose up (PostgreSQL databases)');
console.log('\n💡 If terminals don\'t open, run the commands manually in separate terminals.\n');