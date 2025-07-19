#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Starting stable server with monitoring...');

function startServer() {
  const server = spawn('node', ['app.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  server.on('close', (code) => {
    console.log(`\n💥 Server process exited with code ${code}`);
    console.log('🔄 Restarting server in 2 seconds...');
    
    setTimeout(() => {
      console.log('🚀 Restarting server...');
      startServer();
    }, 2000);
  });

  server.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    setTimeout(() => {
      console.log('🔄 Retrying server start...');
      startServer();
    }, 5000);
  });

  return server;
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Gracefully shutting down...');
  process.exit(0);
});

// Start the server
startServer();