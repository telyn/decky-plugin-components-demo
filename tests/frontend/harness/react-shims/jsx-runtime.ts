// Aliased over 'react/jsx-runtime' (see vite.config.ts) — this is what both
// @decky/ui's precompiled dist output and our own automatic-JSX-runtime
// source compile calls against. See bridge.ts for why it needs to run
// against SteamUI's own React, not a separately-installed copy.
//
// Rather than hunting for a second SteamUI webpack module that happens to
// export the jsx-runtime shape (a real but separate risk — some bundlers
// don't expose it as its own module at all), jsx/jsxs are synthesized from
// plain createElement, which every React build exposes. The automatic
// runtime's jsx(type, config, key) is equivalent to
// createElement(type, {...config, key}) — createElement already reads
// `children` off the config object when no variadic children args follow,
// which is exactly how JSX children arrive here.
import { needReact } from './bridge';

function jsxImpl(type: any, config: any, key?: any) {
  const props = key === undefined ? config : { ...config, key };
  return needReact().createElement(type, props);
}

export const jsx = jsxImpl;
export const jsxs = jsxImpl;
export { Fragment } from './react';
