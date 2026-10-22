// Holds the real React/ReactDOM instances scraped out of SteamUI's own
// webpack modules (see boot.ts's scrapeSteamReactModules), so every
// react-shims/*.ts file can read the same live reference.
//
// Why this exists: @decky/ui's components run hooks against SteamUI's own
// React dispatcher (exposed as window.SP_REACT, read directly by
// @decky/ui/dist/utils/react/react.js). If this harness renders with its
// own separately-installed react/react-dom, there are two live React
// instances in the same component tree, and hook calls made by @decky/ui
// components against SteamUI's dispatcher don't match up with the tree our
// own react-dom is reconciling — React throws (minified error #321,
// "invalid hook call"). Aliasing react/react-dom/jsx-runtime to these shims
// (see vite.config.ts) makes the harness's own JSX go through the exact
// same React/ReactDOM instance SteamUI (and therefore @decky/ui) already
// uses, so there's only ever one.
//
// Set once by boot.ts before main.tsx is imported (component render, which
// is the only place these get called, happens after that point) — see
// need()'s error if something manages to call in before then.
//
// State lives on `window`, not a module-level variable: vite's dependency
// optimizer bundles npm packages (e.g. react-icons, which this project's own
// source imports) separately from unoptimized project source, and when an
// optimized package resolves a bare 'react' import to this *locally
// aliased* file (see vite.config.ts), esbuild/rolldown inlines a SEPARATE
// copy of bridge.ts into that package's bundle — a second module instance
// with its own module-level variables that boot.ts's setReact() call (made
// against the unoptimized-source copy) never touches. A `window` global is
// the one thing every copy actually shares.
const GLOBAL_KEY = '__deckyUiHarnessReactBridge__';

interface BridgeState {
  react: any;
  reactDom: any;
  onReady: Array<() => void>;
}

function state(): BridgeState {
  const w = window as any;
  return (w[GLOBAL_KEY] ??= { react: null, reactDom: null, onReady: [] });
}

export function setReact(react: any, reactDom: any): void {
  const s = state();
  s.react = react;
  s.reactDom = reactDom;
  s.onReady.splice(0).forEach((cb) => cb());
}

export function onReady(cb: () => void): void {
  const s = state();
  if (s.react) cb();
  else s.onReady.push(cb);
}

export function needReact(): any {
  const r = state().react;
  if (!r) {
    throw new Error(
      '[decky-ui-harness] react shim used before SteamUI\'s React was found — ' +
        'something rendered before boot.ts finished. See tests/frontend/harness/boot.ts.',
    );
  }
  return r;
}

export function needReactDom(): any {
  const r = state().reactDom;
  if (!r) {
    throw new Error(
      '[decky-ui-harness] react-dom shim used before SteamUI\'s ReactDOM was found — ' +
        'something rendered before boot.ts finished. See tests/frontend/harness/boot.ts.',
    );
  }
  return r;
}
