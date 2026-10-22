// Loads the real SteamUI bundle (served from /steamui/ by vite.config.ts) in
// the same order Steam's own steamui/index.html loads it, then hands off to
// main.tsx once window.webpackChunksteamui exists — which is what
// @decky/ui's dist/webpack.js needs to resolve real components against.
//
// We can't just copy steamui/index.html's <script> tags into this file:
// their filenames are content-hashed and change with every Steam update. So
// this fetches the real index.html and replays its <link>/<script> tags.

import { installSteamClientStub, installSteamUIStoreStub } from './steam-stub';
import { setReact } from './react-shims/bridge';

const statusEl = document.getElementById('boot-status')!;

function setStatus(text: string, isError = false) {
  statusEl.textContent = text;
  statusEl.className = isError ? 'error' : '';
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(el);
  });
}

function loadStylesheet(href: string): void {
  const el = document.createElement('link');
  el.rel = 'stylesheet';
  el.href = href;
  document.head.appendChild(el);
}

async function waitFor(pred: () => boolean, timeoutMs: number, label: string): Promise<void> {
  const start = performance.now();
  while (!pred()) {
    if (performance.now() - start > timeoutMs) {
      throw new Error(`timed out waiting for ${label}`);
    }
    await new Promise((r) => setTimeout(r, 25));
  }
}

// library.js kicks off its own webpack chunk loading in the background after
// its initial script runs (route-based code splitting etc). @decky/ui's
// module scraping is synchronous and only sees whatever's loaded at the
// moment it runs, so importing it too early (as soon as
// window.webpackChunksteamui exists) misses modules that are still in
// flight — e.g. CommonUIModule, which several components (Toggle, ...)
// resolve from at import time. Wait for chunk-script activity to go quiet
// before handing off to main.tsx.
function waitForChunkQuiescence(quietMs: number, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    let quietTimer: ReturnType<typeof setTimeout>;
    const done = () => {
      observer.disconnect();
      resolve();
    };
    const resetQuietTimer = () => {
      clearTimeout(quietTimer);
      quietTimer = setTimeout(done, quietMs);
    };
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of Array.from(m.addedNodes)) {
          if (node instanceof HTMLScriptElement || node instanceof HTMLLinkElement) {
            resetQuietTimer();
          }
        }
      }
    });
    observer.observe(document.head, { childList: true });
    observer.observe(document.body, { childList: true });
    resetQuietTimer();
    setTimeout(done, timeoutMs);
  });
}

// In the real decky loader, a preload script scrapes SteamUI's own
// React/ReactDOM modules out of its webpack chunks and exposes React as
// window.SP_REACT before any plugin (and therefore @decky/ui) loads —
// @decky/ui/dist/utils/react.js reads window.SP_REACT unconditionally at
// import time and throws if it's missing. We replicate that scrape here,
// and additionally feed both React and ReactDOM into react-shims/bridge.ts
// so this harness's own JSX renders through the exact same instances
// (react-shims/*.ts, aliased over 'react'/'react-dom'/jsx-runtime in
// vite.config.ts) instead of a separately-installed react/react-dom —
// otherwise @decky/ui components hit "invalid hook call" errors from two
// live React instances disagreeing about whose dispatcher is current.
//
// Must run before @decky/ui (or main.tsx) is ever imported, using the same
// "push an empty chunk to get at webpackRequire.m" trick @decky/ui's own
// dist/webpack.js uses.
function scrapeSteamReactModules(): void {
  const w = window as any;
  const id = Symbol('decky-plugin-components-demo:harness');
  let webpackRequire: any;
  w.webpackChunksteamui.push([[id], {}, (r: any) => (webpackRequire = r)]);
  if (!webpackRequire) return;

  let react: any;
  let reactDom: any;
  for (const modId of Object.keys(webpackRequire.m)) {
    if (react && reactDom) break;
    let mod: any;
    try {
      mod = webpackRequire(modId);
    } catch {
      continue;
    }
    const candidate = mod?.default ?? mod;
    if (!candidate || typeof candidate !== 'object') continue;
    if (
      !react &&
      typeof candidate.useState === 'function' &&
      typeof candidate.useEffect === 'function' &&
      typeof candidate.createElement === 'function'
    ) {
      react = candidate;
      continue;
    }
    if (!reactDom && typeof candidate.createRoot === 'function') {
      reactDom = candidate;
    }
  }

  if (react) {
    w.SP_REACT = react;
  } else {
    console.warn(
      '[decky-ui-harness] Could not find a React-shaped module in SteamUI\'s webpack modules. ' +
        '@decky/ui components that depend on window.SP_REACT (utils/react.js) may fail to render.',
    );
  }
  if (!reactDom) {
    console.warn(
      '[decky-ui-harness] Could not find a ReactDOM-shaped module (with createRoot) in SteamUI\'s ' +
        'webpack modules. The harness\'s own render (main.tsx) will fail.',
    );
  }
  if (react && reactDom) {
    setReact(react, reactDom);
  }
}

async function boot() {
  if (!__STEAMUI_AVAILABLE__) {
    setStatus(
      'No local SteamUI bundle found. Set STEAMUI_DIR to a Steam install\'s ' +
        'steamui/ directory (see tests/frontend/harness/vite.config.ts) and restart.',
      true,
    );
    return;
  }

  installSteamClientStub();
  installSteamUIStoreStub();

  setStatus('fetching steamui/index.html…');
  const res = await fetch('/steamui/index.html');
  if (!res.ok) throw new Error(`failed to fetch /steamui/index.html: ${res.status}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  for (const link of Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))) {
    const href = link.getAttribute('href');
    if (href) loadStylesheet(`/steamui${href}`);
  }

  const scriptSrcs = Array.from(doc.querySelectorAll('script[src]'))
    .map((s) => s.getAttribute('src'))
    .filter((s): s is string => !!s);

  for (const src of scriptSrcs) {
    setStatus(`loading ${src}…`);
    await loadScript(`/steamui${src}`);
  }

  setStatus('waiting for webpackChunksteamui…');
  await waitFor(
    () => Array.isArray((window as any).webpackChunksteamui),
    10_000,
    'window.webpackChunksteamui',
  );

  setStatus('waiting for SteamUI chunk loading to settle…');
  // Observed run-to-run: with too short a quiet window, this sometimes cuts
  // in before SteamUI's own lazy-loaded modules (PanelSection, staticClasses,
  // ...) have all registered, so which @decky/ui exports resolve varies
  // between otherwise-identical runs. A longer quiet window trades boot
  // speed for that determinism.
  await waitForChunkQuiescence(2_000, 20_000);

  scrapeSteamReactModules();

  setStatus('SteamUI booted. Mounting demo…');
  await import('./main');
}

boot().catch((err) => {
  console.error(err);
  setStatus(`Boot failed: ${err.message}\n\nSee console for details.`, true);
});
