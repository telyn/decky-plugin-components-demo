// Minimal stand-in for window.SteamClient, the native CEF bridge that Steam's
// own preload script normally injects. @decky/ui components reach into it in
// many places (focus/gamepad nav, sound effects, telemetry...). Outside the
// real Steam overlay nothing provides it, so calls into it would throw.
//
// This is a permissive proxy: any property access returns another proxy that
// is itself callable and returns undefined, and any call resolves to
// `undefined` (or a resolved Promise, since a lot of SteamClient methods are
// async). It does not attempt to be a faithful mock of SteamClient's actual
// behaviour, so functionality that legitimately depends on Steam state
// (running games, friends list, etc.) is out of scope for this harness.

function stubValue(): unknown {
  const fn: any = (..._args: unknown[]) => Promise.resolve(stubValue());
  return new Proxy(fn, {
    get(_target, prop) {
      if (prop === 'then') return undefined; // don't look like a thenable
      return stubValue();
    },
    apply() {
      return Promise.resolve(stubValue());
    },
  });
}

export function installSteamClientStub(): void {
  const w = window as unknown as Record<string, unknown>;
  if (!w.SteamClient) {
    w.SteamClient = stubValue();
  }
  // A couple of globals decky-loader normally sets before @decky/ui loads.
  if (!w.DeckyPluginLoader) {
    w.DeckyPluginLoader = stubValue();
  }
}

// @decky/ui's Navigation.Navigate() (dist/modules/Router.js) looks up
// window.SteamUIStore.GetFocusedWindowInstance() (falling back to
// Router.WindowStore's registered GamepadUI/Library window) to get a
// "window instance" object, then calls .Navigate(path) on it. All of that
// only exists once SteamUI actually opens a real Big Picture/Library
// window — we only load its JS, we never open one, so there's no window
// instance to find and Navigation logs "could not find a window to
// navigate" and does nothing.
//
// Faithfully reproducing SteamUI's window registry is out of scope; this
// stub is just enough to make Navigation.Navigate/CloseSideMenus usable
// for this harness's own purposes — it dispatches a DOM CustomEvent
// ('decky-harness-navigate') that main.tsx listens for to swap between the
// QAM panel and the full-screen route content, standing in for real
// browser navigation.
export const HARNESS_NAVIGATE_EVENT = 'decky-harness-navigate';

export function installSteamUIStoreStub(): void {
  // SteamUI itself defines window.SteamUIStore (it's real, not something we
  // need to fake wholesale) — but its window registry is legitimately empty
  // here since we never open a real Big Picture/Library window, so
  // GetFocusedWindowInstance() genuinely returns nothing.
  //
  // A plain one-time overwrite doesn't stick: SteamUI (re)assigns
  // window.SteamUIStore itself at some point after this runs (its own
  // store initialization isn't finished just because chunk-loading went
  // quiet), clobbering whatever we set. Defining an accessor property
  // instead means any later `window.SteamUIStore = <real store>` from
  // SteamUI is captured rather than replacing our override — reads of
  // window.SteamUIStore always go through a proxy that forwards to
  // whatever the real store currently is, except for
  // GetFocusedWindowInstance, which is always ours.
  const fakeWindow = new Proxy(
    {
      Navigate(path: string) {
        window.dispatchEvent(new CustomEvent(HARNESS_NAVIGATE_EVENT, { detail: path }));
      },
      NavigateBack() {
        window.dispatchEvent(new CustomEvent(HARNESS_NAVIGATE_EVENT, { detail: null }));
      },
    },
    {
      // Everything else (.Navigator, .MenuStore, ...) falls back to the
      // same permissive no-op proxy used for SteamClient.
      get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver);
        return stubValue();
      },
    },
  );

  let realStore: Record<string, unknown> = {};
  const storeProxy = new Proxy(
    {},
    {
      get(_target, prop, _receiver) {
        if (prop === 'GetFocusedWindowInstance') return () => fakeWindow;
        return Reflect.get(realStore, prop);
      },
      set(_target, prop, value) {
        realStore[prop as string] = value;
        return true;
      },
    },
  );

  Object.defineProperty(window, 'SteamUIStore', {
    configurable: true,
    get: () => storeProxy,
    set: (v: Record<string, unknown>) => {
      realStore = v ?? {};
    },
  });
}
