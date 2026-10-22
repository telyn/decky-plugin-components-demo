import { ErrorBoundary } from "@decky/ui";
import type { Demo } from "./types";
import { CodeBlock } from "./CodeBlock";

/**
 * Renders a single Demo: title, docs prose, then each Example in turn.
 *
 * Live examples are wrapped in @decky/ui's ErrorBoundary so a component
 * that resolves but misbehaves at runtime doesn't take the whole demo route
 * down with it. Examples flagged `unavailable` (component didn't resolve
 * on this SteamUI build at all) skip rendering entirely — there's nothing
 * useful to wrap in an error boundary, we just say so.
 */
export function DemoPage({ demo }: { demo: Demo }) {
  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ marginBottom: 4 }}>{demo.title}</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>{demo.summary}</p>
      <div style={{ marginBottom: 32 }}>{demo.docs}</div>

      {demo.examples.map((ex) => (
        <section
          key={ex.title}
          style={{
            marginBottom: 28,
            paddingBottom: 20,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h3 style={{ marginBottom: 4 }}>{ex.title}</h3>
          {ex.note && (
            <p style={{ opacity: 0.7, fontSize: 13, marginTop: 0 }}>
              {ex.note}
            </p>
          )}

          {ex.unavailable ? (
            <div
              style={{
                padding: "10px 12px",
                marginBottom: 10,
                border: "1px dashed rgba(255,255,255,0.25)",
                borderRadius: 4,
                fontStyle: "italic",
                opacity: 0.7,
              }}
            >
              Couldn't resolve this component on the current SteamUI build —
              no live example available. See the docs above and the code
              below for how it's meant to be used.
            </div>
          ) : (
            <ErrorBoundary>
              <div
                style={{
                  padding: 12,
                  marginBottom: 10,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 4,
                }}
              >
                {ex.render()}
              </div>
            </ErrorBoundary>
          )}

          <CodeBlock code={ex.code} />
        </section>
      ))}
    </div>
  );
}
