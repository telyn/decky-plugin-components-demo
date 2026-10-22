import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default install location for Steam on macOS. Override with STEAMUI_DIR if
// Steam lives somewhere else (Linux/Windows/custom install).
const DEFAULT_STEAMUI_DIR = path.join(
  process.env.HOME ?? '',
  'Library/Application Support/Steam/Steam.AppBundle/Steam/Contents/MacOS/steamui',
);
const STEAMUI_DIR = process.env.STEAMUI_DIR
  ? path.resolve(process.env.STEAMUI_DIR)
  : DEFAULT_STEAMUI_DIR;

if (!fs.existsSync(STEAMUI_DIR)) {
  console.warn(
    `[decky-ui-harness] steamui bundle not found at ${STEAMUI_DIR}.\n` +
      `Set STEAMUI_DIR to a Steam install's steamui/ directory to render real @decky/ui components.`,
  );
}

function contentType(filePath: string): string {
  const ext = path.extname(filePath);
  return ext === '.js'
    ? 'application/javascript'
    : ext === '.css'
      ? 'text/css'
      : ext === '.html'
        ? 'text/html'
        : 'application/octet-stream';
}

function serveFromSteamUI(reqPath: string, res: import('http').ServerResponse): boolean {
  const filePath = path.join(STEAMUI_DIR, reqPath);
  if (!filePath.startsWith(STEAMUI_DIR) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return false;
  }
  res.setHeader('Content-Type', contentType(filePath));
  fs.createReadStream(filePath).pipe(res);
  return true;
}

// Serves the real SteamUI bundle straight from the local Steam install.
// This is what lets @decky/ui's webpack-scraping (see
// node_modules/@decky/ui/dist/webpack.js) resolve real components instead
// of nothing.
//
// Two mount points, both registered as PRE middleware (i.e. run before
// vite's own transform/html-fallback/index-html middlewares):
//  - /steamui/* : used by boot.ts to fetch steamui/index.html and discover
//    the current (content-hashed) entrypoint filenames.
//  - /*         : library.js's webpack is built with publicPath "/", so it
//    requests its own chunks (/library.js, /1133.js, /css/*.css,
//    /libraries/*.js?contenthash=..., ...) as root-absolute URLs. This has
//    to run *before* vite's internals: vite's transformMiddleware treats
//    any .js request as a module load and (for these, since they're not
//    part of the harness's own module graph) was observed to short-circuit
//    them straight to a 503/HTML fallback rather than falling through to
//    post middleware. Running first sidesteps that entirely.
//    "/" and "/index.html" are excluded so the harness's own root page
//    (tests/frontend/harness/index.html) always wins — STEAMUI_DIR
//    happens to have its own same-named index.html at its root.
function serveSteamUI(): Plugin {
  return {
    name: 'serve-steamui',
    configureServer(server) {
      server.middlewares.use('/steamui', (req, res, next) => {
        const reqPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
        if (!serveFromSteamUI(reqPath, res)) next();
      });
      server.middlewares.use((req, res, next) => {
        const reqPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
        if (reqPath === '/' || reqPath === '/index.html') {
          next();
          return;
        }
        if (!serveFromSteamUI(reqPath, res)) next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveSteamUI()],
  define: {
    __STEAMUI_AVAILABLE__: JSON.stringify(fs.existsSync(STEAMUI_DIR)),
  },
  resolve: {
    alias: {
      // @decky/api needs the decky loader (native bridge) to function; mock it.
      '@decky/api': path.resolve(__dirname, '../mocks/decky-api.ts'),
      // @decky/ui is NOT mocked: it's loaded for real, resolved against the
      // real SteamUI bundle injected by boot.ts, so components look and
      // behave like they do in the actual overlay.

      // react/react-dom ARE effectively mocked too, but as thin proxies to
      // SteamUI's own instances rather than fake implementations — see
      // react-shims/bridge.ts for why (two live React instances in one
      // tree otherwise breaks @decky/ui's hooks).
      'react/jsx-dev-runtime': path.resolve(__dirname, 'react-shims/jsx-dev-runtime.ts'),
      'react/jsx-runtime': path.resolve(__dirname, 'react-shims/jsx-runtime.ts'),
      'react-dom/client': path.resolve(__dirname, 'react-shims/react-dom-client.ts'),
      'react-dom': path.resolve(__dirname, 'react-shims/react-dom.ts'),
      react: path.resolve(__dirname, 'react-shims/react.ts'),
    },
  },
});
