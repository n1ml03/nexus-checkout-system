// Type declarations for modules without proper TypeScript definitions

declare module 'express' {
  import { Express } from 'express-serve-static-core';
  const express: () => Express;
  export default express;
}

declare module 'cors' {
  import { RequestHandler } from 'express-serve-static-core';
  const cors: () => RequestHandler;
  export default cors;
}

declare module 'pg' {
  export class Pool {
    constructor(options?: any);
    query(text: string, params?: any[]): Promise<any>;
    end(): Promise<void>;
  }
}
