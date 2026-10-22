// Aliased over 'react-dom/client' (see vite.config.ts) — main.tsx's
// createRoot() needs to come from the same ReactDOM instance that reconciles
// SteamUI's own tree, for the same reason react.ts proxies to SteamUI's
// React (see bridge.ts).
import { needReactDom } from './bridge';

export const createRoot = (...a: any[]) => needReactDom().createRoot(...a);
export const hydrateRoot = (...a: any[]) => needReactDom().hydrateRoot(...a);
// The real 'react-dom/client' package has no default export, but
// `import ReactDOM from 'react-dom/client'` is common enough (main.tsx does
// it) that TS/bundler interop usually papers over it. Since our alias
// replaces the real module outright, that interop doesn't kick in — so
// supply one directly.
export default { createRoot, hydrateRoot };
