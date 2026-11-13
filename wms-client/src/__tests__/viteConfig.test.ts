import { DEFAULT_API_PROXY_TARGET, devApiProxy } from '../utilities/devApiProxy';

// API.ts falls back to "/" when no API base URL is configured, so `npm start` on a fresh
// clone needs the dev server to forward /api to the Spring Boot backend (dev's default
// was http://localhost:8080). vite.config.ts uses devApiProxy for the dev and preview servers.

describe('vite /api proxy', () => {
  test('forwards /api to localhost:8080 by default', () => {
    expect(DEFAULT_API_PROXY_TARGET).toBe('http://localhost:8080');
    expect(devApiProxy({})).toEqual({
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    });
  });

  test('VITE_API_PROXY_TARGET points the proxy at another backend', () => {
    expect(devApiProxy({ VITE_API_PROXY_TARGET: 'http://192.168.20.113:8080' })['/api'].target).toBe(
      'http://192.168.20.113:8080'
    );
  });

  test('vite.config.ts wires it into the dev and preview servers', async () => {
    // vite.config.ts cannot be imported under jsdom (esbuild), so check its source.
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const source = await readFile(join(process.cwd(), 'vite.config.ts'), 'utf8');
    expect(source).toMatch(/server:\s*\{[^}]*proxy:\s*devApiProxy\(/);
    expect(source).toMatch(/preview:\s*\{[^}]*proxy:\s*devApiProxy\(/);
  });
});
