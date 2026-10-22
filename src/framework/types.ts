import type { ReactNode } from "react";

/**
 * A single example of a component (or a small combination of components)
 * in use.
 *
 * `unavailable` is not part of the original spec but was added because the
 * demo needs to distinguish "this component resolved to `undefined` on the
 * current SteamUI build, don't even attempt to render it" from "this
 * component rendered and threw" (the latter is what `ErrorBoundary` is
 * for). When `unavailable` is true, `DemoPage` skips calling `render()`
 * entirely and shows a dedicated fallback message instead.
 */
export interface Example {
  title: string;
  note?: string;
  code: string;
  render: () => ReactNode;
  /** True when the underlying @decky/ui export was falsy on this build. */
  unavailable?: boolean;
}

export interface Demo {
  id: string;
  title: string;
  summary: string;
  docs: ReactNode;
  examples: Example[];
}

/**
 * True when a @decky/ui export resolved on this build.
 *
 * @decky/ui's .d.ts files declare most exports as always-defined function
 * types, but at runtime they're the result of heuristic module-scraping
 * against the real SteamUI bundle (see node_modules/@decky/ui/dist/**\/*.js)
 * and can legitimately be `undefined`. Going through this helper (instead
 * of `if (Component)` / `Component ? ... : ...` directly on the imported
 * binding) sidesteps TypeScript's "this condition will always return true"
 * (TS2774) false positive that the declared-vs-actual type mismatch causes.
 */
export function resolved(value: unknown): boolean {
  return Boolean(value);
}
