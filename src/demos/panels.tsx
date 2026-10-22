import { Focusable, FocusRing, Marquee, ControlsList } from "@decky/ui";
import { resolved } from "../framework/types";
import type { Demo, Example } from "../framework/types";

const panelSectionNote: Example = {
  title: "PanelSection / PanelSectionRow",
  note: "These are QAM-only layout primitives (they carry Quick Access Menu styling — narrow-panel padding, section titles, etc.) and don't look/behave correctly rendered inside a full-page route, so there's no live example on this page. See the QAM panel (the plugin's Quick Access Menu content) for a live PanelSection/PanelSectionRow in its natural habitat.",
  code: `<PanelSection title="Panel Section">
  <PanelSectionRow>
    <ButtonItem layout="below" onClick={...}>Click</ButtonItem>
  </PanelSectionRow>
</PanelSection>`,
  render: () => null,
  unavailable: true,
};

function FocusableExample() {
  return (
    <Focusable style={{ display: "flex", gap: 8 }}>
      <Focusable
        style={{ padding: 8, border: "1px solid #666" }}
        onActivate={() => console.log("activated tile 1")}
      >
        Tile 1
      </Focusable>
      <Focusable
        style={{ padding: 8, border: "1px solid #666" }}
        onActivate={() => console.log("activated tile 2")}
      >
        Tile 2
      </Focusable>
    </Focusable>
  );
}

function FocusRingExample() {
  return (
    <FocusRing>
      <div style={{ padding: 8, border: "1px dashed #888" }}>
        Content wrapped in a FocusRing
      </div>
    </FocusRing>
  );
}

function MarqueeExample() {
  return (
    <div style={{ width: 200, overflow: "hidden" }}>
      <Marquee play>
        This text is long enough that it should scroll if it overflows its container width
      </Marquee>
    </div>
  );
}

function ControlsListExample() {
  return (
    <ControlsList spacing="standard">
      <div>Row 1</div>
      <div>Row 2</div>
      <div>Row 3</div>
    </ControlsList>
  );
}

const focusableExample: Example = resolved(Focusable)
  ? {
      title: "Focusable",
      note: "The building block behind SteamUI's gamepad/keyboard navigation — extends HTMLAttributes<HTMLDivElement> + FooterLegendProps, plus onActivate/onCancel for the 'confirm' and 'back' gamepad actions and flow-children for nav-tree hints.",
      code: `<Focusable style={{ display: "flex", gap: 8 }}>
  <Focusable onActivate={() => console.log("activated")}>Tile</Focusable>
</Focusable>`,
      render: () => <FocusableExample />,
    }
  : { title: "Focusable", code: `<Focusable onActivate={...}>Tile</Focusable>`, render: () => null, unavailable: true };

const focusRingExample: Example = resolved(FocusRing)
  ? {
      title: "FocusRing",
      note: "Draws the visual focus ring/outline around its children. render lets you swap the wrapping element type; NavigationManager is an advanced/internal override (type is `any` — undocumented upstream).",
      code: `<FocusRing>
  <div>Content wrapped in a FocusRing</div>
</FocusRing>`,
      render: () => <FocusRingExample />,
    }
  : { title: "FocusRing", code: `<FocusRing><div>Content</div></FocusRing>`, render: () => null, unavailable: true };

const marqueeExample: Example = resolved(Marquee)
  ? {
      title: "Marquee",
      note: "Scrolls its children horizontally when they overflow the container. play/direction/speed/delay/fadeLength/center/resetOnPause control the animation; children is required.",
      code: `<div style={{ width: 200, overflow: "hidden" }}>
  <Marquee play>Long text that overflows...</Marquee>
</div>`,
      render: () => <MarqueeExample />,
    }
  : { title: "Marquee", code: `<Marquee play>Long text...</Marquee>`, render: () => null, unavailable: true };

const controlsListExample: Example = resolved(ControlsList)
  ? {
      title: "ControlsList",
      note: "A simple vertical list layout helper for grouping controls with consistent alignment/spacing (alignItems, spacing: 'standard' | 'extra').",
      code: `<ControlsList spacing="standard">
  <div>Row 1</div>
  <div>Row 2</div>
</ControlsList>`,
      render: () => <ControlsListExample />,
    }
  : { title: "ControlsList", code: `<ControlsList spacing="standard">...</ControlsList>`, render: () => null, unavailable: true };

export const panelsDemo: Demo = {
  id: "panels",
  title: "Panels & Layout",
  summary: "Layout and focus primitives that most other components are built on top of.",
  docs: (
    <div>
      <p>
        PanelSection/PanelSectionRow are QAM-specific and are demoed live in
        the Quick Access Menu panel instead of here (see note below).
        Focusable and FocusRing are the lower-level primitives that give
        SteamUI its gamepad/keyboard navigation and focus-ring visuals — most
        other interactive components (ButtonItem, DialogButton, ...) are
        built on Focusable internally.
      </p>
    </div>
  ),
  examples: [
    panelSectionNote,
    focusableExample,
    focusRingExample,
    marqueeExample,
    controlsListExample,
  ],
};
