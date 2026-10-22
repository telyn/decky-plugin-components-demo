// Aliased over 'react/jsx-dev-runtime' — vite's dev-mode JSX transform for
// our own source files uses jsxDEV instead of jsx/jsxs. See jsx-runtime.ts
// for why this synthesizes from createElement rather than needing a
// dedicated SteamUI module. The dev-only arguments (isStaticChildren,
// source, self) are accepted for signature compatibility but not used —
// this shim isn't trying to reproduce React DevTools' dev warnings, only
// to render through the correct single React instance.
import { needReact } from './bridge';

export function jsxDEV(type: any, config: any, key?: any, ..._devArgs: any[]) {
  const props = key === undefined ? config : { ...config, key };
  return needReact().createElement(type, props);
}

export { Fragment } from './react';
