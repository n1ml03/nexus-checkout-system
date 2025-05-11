/**
 * Browser-compatible mock for Node.js process object
 * 
 * This provides a minimal implementation of the Node.js process object
 * for browser environments.
 */

// Create a minimal process object with commonly used properties
const processMock = {
  env: {
    NODE_ENV: import.meta.env.MODE || 'development',
    // Add any environment variables from Vite
    ...Object.fromEntries(
      Object.entries(import.meta.env).map(([key, value]) => [key.replace('VITE_', ''), value])
    )
  },
  
  // Basic platform detection
  platform: navigator.platform.toLowerCase().includes('win') ? 'win32' : 
            navigator.platform.toLowerCase().includes('mac') ? 'darwin' : 'linux',
  
  // Browser doesn't have process.stdout/stderr, so we mock them
  stdout: {
    write: (data) => console.log('[process.stdout]', data),
    isTTY: false
  },
  stderr: {
    write: (data) => console.error('[process.stderr]', data),
    isTTY: false
  },
  
  // Mock process.exit
  exit: (code) => {
    console.warn(`[process.exit] called with code ${code}`);
    // In a browser, we can't actually exit the process
    throw new Error(`Process exit (${code}) called in browser environment`);
  },
  
  // Mock process.nextTick
  nextTick: (callback, ...args) => {
    setTimeout(() => callback(...args), 0);
  },
  
  // Mock process.cwd
  cwd: () => '/',
  
  // Mock process.version
  version: 'v0.0.0-browser',
  
  // Mock process.versions
  versions: {
    node: '0.0.0',
    browser: navigator.userAgent
  },
  
  // Mock process.pid
  pid: 1,
  
  // Mock process.argv
  argv: ['browser', 'browser'],
  
  // Mock process.on
  on: (event, listener) => {
    console.log(`[process.on] Registered listener for event: ${event}`);
    // We don't actually register any listeners in the browser
    return processMock;
  },
  
  // Mock process.off
  off: (event, listener) => {
    console.log(`[process.off] Removed listener for event: ${event}`);
    return processMock;
  },
  
  // Mock process.once
  once: (event, listener) => {
    console.log(`[process.once] Registered one-time listener for event: ${event}`);
    return processMock;
  },
  
  // Mock process.removeListener
  removeListener: (event, listener) => {
    console.log(`[process.removeListener] Removed listener for event: ${event}`);
    return processMock;
  },
  
  // Mock process.removeAllListeners
  removeAllListeners: (event) => {
    console.log(`[process.removeAllListeners] Removed all listeners for event: ${event}`);
    return processMock;
  },
  
  // Mock process.listeners
  listeners: (event) => {
    console.log(`[process.listeners] Getting listeners for event: ${event}`);
    return [];
  },
  
  // Mock process.emit
  emit: (event, ...args) => {
    console.log(`[process.emit] Emitting event: ${event}`, args);
    return false;
  }
};

export default processMock;
