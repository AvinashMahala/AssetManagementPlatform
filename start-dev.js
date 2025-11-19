#!/usr/bin/env node

/**
 * Platform-agnostic development server starter
 * Opens two separate terminals: one for backend, one for frontend
 */

const { spawn } = require('child_process');
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
openTerminal(backendCommand, backendDir, 'Backend');

// Open frontend terminal
const frontendCommand = 'npm run dev';
setTimeout(() => {
  openTerminal(frontendCommand, frontendDir, 'Frontend');
}, 1000); // Small delay to prevent overwhelming the system

console.log('\n✅ Terminals opened successfully!');
console.log('📊 Backend terminal: cd backend && npm run dev (port 5000)');
console.log('🌐 Frontend terminal: cd frontend && npm run dev (port 5173)');
console.log('\n💡 If terminals don\'t open, run the commands manually in separate terminals.\n');