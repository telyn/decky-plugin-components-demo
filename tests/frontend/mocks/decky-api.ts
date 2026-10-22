// Mock of @decky/api for the browser test harness. @decky/api needs the
// decky loader's native bridge to actually do anything, so it's mocked here
// the same way decky-intiface's harness mocks it — see
// ../../../../decky-intiface/tests/frontend/mocks/decky-api.ts for the
// sibling implementation this one is modeled on.
//
// @decky/ui is deliberately NOT mocked (see harness/vite.config.ts):
// this harness loads the real SteamUI bundle so real components render.

type AnyFn = (...args: unknown[]) => unknown;

const _callables = new Map<string, AnyFn>();
const _handlers = new Map<string, AnyFn[]>();

export function callable<TArgs extends unknown[], TRet>(
  name: string,
): (...args: TArgs) => Promise<TRet> {
  return async (...args: TArgs): Promise<TRet> => {
    const impl = _callables.get(name);
    if (impl) return impl(...args) as TRet;
    console.warn(`[decky-api mock] no impl for callable "${name}", returning null`);
    return null as unknown as TRet;
  };
}

export function addEventListener<TArgs extends unknown[]>(
  event: string,
  handler: (...args: TArgs) => void,
): (...args: TArgs) => void {
  const list = _handlers.get(event) ?? [];
  list.push(handler as AnyFn);
  _handlers.set(event, list);
  return handler;
}

export function removeEventListener<TArgs extends unknown[]>(
  event: string,
  handler: (...args: TArgs) => void,
): void {
  const list = _handlers.get(event) ?? [];
  _handlers.set(event, list.filter((h) => h !== handler));
}

export function definePlugin<T>(factory: () => T): T {
  return factory();
}

export const toaster = {
  toast: (_opts: unknown) => {},
};

export const routerHook = {
  addRoute: (_path: string, _component: unknown, _opts?: unknown) => {},
  removeRoute: (_path: string) => {},
};
