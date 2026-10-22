// Aliased over 'react-dom' (see vite.config.ts). Nothing in this project or
// @decky/ui's dist imports the pre-React-18 'react-dom' entry point
// directly (createRoot lives under 'react-dom/client', see
// react-dom-client.ts) — this exists so the bare specifier still resolves
// to something rather than erroring, and proxies through for completeness.
import { needReactDom } from './bridge';

const namespaceProxy = new Proxy(
  {},
  { get: (_t, prop) => needReactDom()[prop] },
);
export default namespaceProxy;
export const createPortal = (...a: any[]) => needReactDom().createPortal(...a);
export const flushSync = (...a: any[]) => needReactDom().flushSync(...a);
