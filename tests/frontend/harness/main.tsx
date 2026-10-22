import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from '@decky/ui';
import { HARNESS_NAVIGATE_EVENT } from './steam-stub';

// Imported dynamically (from boot.ts) only after window.webpackChunksteamui
// exists, so @decky/ui's module-scraping (dist/webpack.js) has real SteamUI
// modules to resolve against when this module (and therefore src/index,
// which imports @decky/ui) first evaluates.
const pluginDescriptor = (await import('../../../src/index')).default;
const DemoRoute = (await import('../../../src/DemoRoute')).default;

// There's no real routerHook/browser navigation in this harness (@decky/api
// is mocked — see mocks/decky-api.ts — and routerHook.addRoute is a no-op
// there), so clicking the QAM panel's "open full demo" button wouldn't
// otherwise go anywhere. steam-stub.ts's SteamUIStore stub dispatches
// HARNESS_NAVIGATE_EVENT in place of real navigation; this just swaps which
// tree is rendered in response, standing in for the real route change.
function Root() {
  const [showDemoRoute, setShowDemoRoute] = useState(false);
  useEffect(() => {
    const handler = (e: Event) => setShowDemoRoute(!!(e as CustomEvent).detail);
    window.addEventListener(HARNESS_NAVIGATE_EVENT, handler);
    return () => window.removeEventListener(HARNESS_NAVIGATE_EVENT, handler);
  }, []);

  return (
    <ErrorBoundary>
      {showDemoRoute ? <DemoRoute /> : <div style={{ width: 360 }}>{pluginDescriptor.content}</div>}
    </ErrorBoundary>
  );
}

// No <React.StrictMode> here (deliberately): StrictMode intentionally
// double-invokes render/effects in dev to surface unsafe side effects —
// useful for components we author, but the components under test here are
// real SteamUI internals we're only borrowing (via react-shims/*), compiled
// assuming a single mount that fully owns its DOM subtree. Double-invoking
// their mount/unmount produced a real crash switching between demo pages
// (React DOM's removeChild throwing "node to be removed is not a child of
// this node" — two mount cycles fighting over the same DOM nodes).
ReactDOM.createRoot(document.getElementById('harness-root')!).render(<Root />);
