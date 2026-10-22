/** Plain monospace code renderer. No syntax highlighting on purpose — keep it simple. */
export function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      style={{
        background: "rgba(0, 0, 0, 0.35)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 4,
        padding: "10px 12px",
        overflowX: "auto",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: 12,
        lineHeight: 1.5,
        whiteSpace: "pre",
        margin: 0,
      }}
    >
      <code>{code.trim()}</code>
    </pre>
  );
}
