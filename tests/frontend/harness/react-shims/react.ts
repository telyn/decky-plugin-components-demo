// Aliased over the 'react' import (see vite.config.ts). Proxies every call
// through to SteamUI's own React instance — see bridge.ts for why.
import { needReact, onReady } from './bridge';

// Values used as bare identifiers (not called) — e.g. `<>...</>` compiles to
// `jsx(Fragment, ...)`, referencing this binding's value directly. These are
// `let` exports so importers see the live-binding update once boot.ts calls
// setReact(), same as native ESM re-exports behave.
export let Fragment: any;
export let StrictMode: any;
export let Profiler: any;
export let Suspense: any;
export let version: string | undefined;
onReady(() => {
  const r = needReact();
  Fragment = r.Fragment;
  StrictMode = r.StrictMode;
  Profiler = r.Profiler;
  Suspense = r.Suspense;
  version = r.version;
});

// Everything else is only ever used by *calling* it, so a thin forwarding
// function is enough — no live-binding trick needed.
export const createElement = (...a: any[]) => needReact().createElement(...a);
export const cloneElement = (...a: any[]) => needReact().cloneElement(...a);
export const isValidElement = (...a: any[]) => needReact().isValidElement(...a);
export const createContext = (...a: any[]) => needReact().createContext(...a);
export const createRef = (...a: any[]) => needReact().createRef(...a);
export const forwardRef = (...a: any[]) => needReact().forwardRef(...a);
export const memo = (...a: any[]) => needReact().memo(...a);
export const lazy = (...a: any[]) => needReact().lazy(...a);
export const useState = (...a: any[]) => needReact().useState(...a);
export const useEffect = (...a: any[]) => needReact().useEffect(...a);
export const useLayoutEffect = (...a: any[]) => needReact().useLayoutEffect(...a);
export const useMemo = (...a: any[]) => needReact().useMemo(...a);
export const useCallback = (...a: any[]) => needReact().useCallback(...a);
export const useRef = (...a: any[]) => needReact().useRef(...a);
export const useContext = (...a: any[]) => needReact().useContext(...a);
export const useReducer = (...a: any[]) => needReact().useReducer(...a);
export const useId = (...a: any[]) => needReact().useId(...a);
export const useImperativeHandle = (...a: any[]) => needReact().useImperativeHandle(...a);
export const useDebugValue = (...a: any[]) => needReact().useDebugValue(...a);
export const useDeferredValue = (...a: any[]) => needReact().useDeferredValue(...a);
export const useTransition = (...a: any[]) => needReact().useTransition(...a);
export const useSyncExternalStore = (...a: any[]) => needReact().useSyncExternalStore(...a);
export const startTransition = (...a: any[]) => needReact().startTransition(...a);
export const Children = new Proxy(
  {},
  { get: (_t, prop) => needReact().Children[prop] },
);

// `class Foo extends Component` needs the *real* Component/PureComponent —
// a wrapper class wouldn't preserve React's internal class markers. None of
// this project's own code or @decky/ui's dist currently uses class
// components (checked), so these are defensive rather than exercised.
export const Component = new Proxy(function () {}, {
  construct: (_t, args) => Reflect.construct(needReact().Component, args),
  get: (_t, prop) => needReact().Component[prop],
});
export const PureComponent = new Proxy(function () {}, {
  construct: (_t, args) => Reflect.construct(needReact().PureComponent, args),
  get: (_t, prop) => needReact().PureComponent[prop],
});

const namespaceProxy = new Proxy(
  {},
  {
    get: (_t, prop) => needReact()[prop],
  },
);
export default namespaceProxy;
