# Browser PostgreSQL Compatibility

This document explains how we've implemented browser compatibility for the PostgreSQL client in this project.

## Overview

The PostgreSQL client (`pg`) is a Node.js library that doesn't work natively in browser environments due to several dependencies on Node.js-specific modules like `net`, `tls`, and `events`. To make our application work in the browser, we've implemented several compatibility layers:

1. **Browser-compatible PostgreSQL client**: A mock implementation that mimics the `pg` API but works in the browser
2. **Node.js polyfills**: Using Vite plugins to provide browser-compatible versions of Node.js modules
3. **Process shim**: A global `process` object that mimics the Node.js process in the browser

## Implementation Details

### 1. Browser-compatible PostgreSQL Client

We've created a mock implementation of the PostgreSQL client in `src/services/db/pg-browser-client.ts`. This file exports the same interface as the `pg` module but with browser-compatible implementations:

- `Pool` class that mimics the PostgreSQL connection pool
- `PoolClient` class that mimics a PostgreSQL client
- `QueryResult` interface for query results
- Helper functions like `query` and `transaction`

### 2. Vite Configuration

We've configured Vite to:

1. Use the `vite-plugin-node-polyfills` plugin to provide browser-compatible versions of Node.js modules
2. Alias the `pg` module to our browser-compatible implementation
3. Alias the `cloudflare:sockets` module to a mock implementation
4. Alias the `process` module to a browser-compatible implementation

```js
// vite.config.ts
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  // ...
  plugins: [
    // ...
    nodePolyfills({
      protocolImports: true,
      include: ['events', 'buffer', 'process', 'stream', 'util', 'path', 'net', 'tls', 'crypto']
    }),
  ],
  resolve: {
    alias: {
      // ...
      "cloudflare:sockets": path.resolve(__dirname, "./src/mocks/cloudflare-sockets.js"),
      "pg": path.resolve(__dirname, "./src/services/db/pg-browser-client.ts"),
      "process": path.resolve(__dirname, "./src/mocks/process.js"),
    },
  },
  // ...
});
```

### 3. Global Process Shim

We've added a global `process` shim in `src/main.tsx` to provide a browser-compatible version of the Node.js `process` object:

```js
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
```

## Limitations

This implementation has some limitations:

1. It doesn't actually connect to a PostgreSQL database in the browser (which is impossible due to browser security restrictions)
2. It returns mock data instead of real database results
3. It logs operations to the console for debugging purposes

## Server-Side Implementation

For server-side code (Node.js environment), you should use the real PostgreSQL client:

```js
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});
```

## Adding Real Data

To make the mock implementation return realistic data, you can modify the `query` function in `src/services/db/pg-browser-client.ts` to return mock data based on the query:

```js
export async function query<T = any>(
  sql: string,
  params: any[] = [],
  name?: string
): Promise<QueryResult<T>> {
  try {
    // Return mock data based on the query
    if (sql.includes('SELECT * FROM products')) {
      return {
        rows: [
          { id: '1', name: 'Product 1', price: 10 },
          { id: '2', name: 'Product 2', price: 20 },
        ],
        rowCount: 2,
        command: 'SELECT',
        fields: []
      };
    }
    
    // Default mock response
    return {
      rows: [],
      rowCount: 0,
      command: sql.split(' ')[0],
      fields: []
    };
  } catch (error: any) {
    console.error('Database query error:', error);
    toast.error(`Database error: ${error.message || 'Unknown error'}`);
    throw error;
  }
}
```
