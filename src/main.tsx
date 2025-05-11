import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Import custom toast styles
import './styles/toast.css'
// Import i18n configuration
import './i18n/i18n'
// Import process mock for browser compatibility
import processMock from './mocks/process.js'

// Add process to window for libraries that expect it to be global
if (typeof window !== 'undefined' && !window.process) {
  window.process = processMock;
}

// Polyfill global.process for libraries that expect it
if (typeof globalThis !== 'undefined' && !globalThis.process) {
  globalThis.process = processMock;
}

// Log environment information
console.log('Environment:', import.meta.env.MODE);
console.log('Using process mock in browser');

// Service worker registration removed - offline support disabled

createRoot(document.getElementById("root")!).render(<App />);
