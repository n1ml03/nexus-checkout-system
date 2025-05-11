/**
 * Global type declarations for the application
 */

// Extend the Window interface to include our process mock
interface Window {
  process: any;
}

// Extend the globalThis interface to include our process mock
interface globalThis {
  process: any;
}
