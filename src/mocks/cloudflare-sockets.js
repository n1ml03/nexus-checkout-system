/**
 * Browser-compatible mock implementation of Cloudflare Workers Sockets API
 *
 * This provides a compatibility layer for the pg package when running in a browser environment.
 * It doesn't actually connect to any sockets but provides the expected interface.
 */

/**
 * Connect to a TCP socket (mock implementation for browser)
 * @param {string} address - The address to connect to (host:port)
 * @param {object} options - Connection options
 * @returns {object} - A socket-like object
 */
export function connect(address, options = {}) {
  console.log(`[MOCK] Cloudflare socket connect called with address: ${address}`, options);

  const [host, port] = address.split(':');

  // Create a mock readable stream
  const readable = new ReadableStream({
    start(controller) {
      // This is a mock implementation that doesn't actually read from a socket
      console.log(`[MOCK] ReadableStream created for ${host}:${port}`);
    },
    pull(controller) {
      // In a real implementation, this would pull data from the socket
      // For our mock, we'll just close the stream after a delay
      setTimeout(() => {
        controller.close();
      }, 100);
    },
    cancel() {
      console.log(`[MOCK] ReadableStream cancelled for ${host}:${port}`);
    }
  });

  // Create a mock writable stream
  const writable = new WritableStream({
    write(chunk) {
      console.log(`[MOCK] WritableStream write called with chunk length: ${chunk.length}`);
      return Promise.resolve();
    },
    close() {
      console.log(`[MOCK] WritableStream closed for ${host}:${port}`);
      return Promise.resolve();
    },
    abort(reason) {
      console.log(`[MOCK] WritableStream aborted: ${reason}`);
    }
  });

  // Create a wrapper that mimics the Cloudflare sockets API
  return {
    readable,
    writable,
    closed: new Promise((resolve) => {
      // Simulate a connection that closes after a short delay
      setTimeout(() => {
        console.log(`[MOCK] Socket closed for ${host}:${port}`);
        resolve();
      }, 200);
    }),
    close: () => {
      console.log(`[MOCK] Socket close called for ${host}:${port}`);
    }
  };
}

export default { connect };
