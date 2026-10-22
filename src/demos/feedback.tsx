import { ProgressBar, ProgressBarWithInfo, ProgressBarItem, Spinner, SteamSpinner } from "@decky/ui";
import { resolved } from "../framework/types";
import type { Demo, Example } from "../framework/types";

const progressBarExample: Example = resolved(ProgressBar)
  ? {
      title: "ProgressBar",
      note: "Bare progress bar: indeterminate for a busy/loading state, or nProgress (0-100, presumably a percentage) for determinate. nTransitionSec controls the fill animation duration.",
      code: `<ProgressBar nProgress={65} />`,
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ProgressBar nProgress={65} />
          <ProgressBar indeterminate />
        </div>
      ),
    }
  : { title: "ProgressBar", code: `<ProgressBar nProgress={65} />`, render: () => null, unavailable: true };

const progressBarWithInfoExample: Example = resolved(ProgressBarWithInfo)
  ? {
      title: "ProgressBarWithInfo",
      note: "ProgressBarItem's props (ItemProps + indeterminate/nProgress/nTransitionSec/focusable) plus sTimeRemaining and sOperationText for the extra info text alongside the bar.",
      code: `<ProgressBarWithInfo
  label="Downloading"
  nProgress={40}
  sOperationText="Downloading update..."
  sTimeRemaining="2 minutes remaining"
/>`,
      render: () => (
        <ProgressBarWithInfo
          label="Downloading"
          nProgress={40}
          sOperationText="Downloading update..."
          sTimeRemaining="2 minutes remaining"
        />
      ),
    }
  : { title: "ProgressBarWithInfo", code: `<ProgressBarWithInfo label="..." nProgress={40} sOperationText="..." sTimeRemaining="..." />`, render: () => null, unavailable: true };

const progressBarItemExample: Example = resolved(ProgressBarItem)
  ? {
      title: "ProgressBarItem",
      note: "Extends ItemProps (label, description, icon, layout, ...) — the row-shaped version of ProgressBar for use in Field-style lists/settings pages.",
      code: `<ProgressBarItem label="Installing" nProgress={80} />`,
      render: () => <ProgressBarItem label="Installing" nProgress={80} />,
    }
  : { title: "ProgressBarItem", code: `<ProgressBarItem label="Installing" nProgress={80} />`, render: () => null, unavailable: true };

const spinnerExample: Example = resolved(Spinner)
  ? {
      title: "Spinner",
      note: "Typed as `any` — resolved (per dist/components/Spinner.js) by pattern-matching an SVG spinner icon from SteamUI's icon module, so its accepted props are effectively whatever that underlying SVG component accepts (unconfirmed from types; treat any props beyond none as speculative).",
      code: `<Spinner />`,
      render: () => <Spinner />,
    }
  : { title: "Spinner", code: `<Spinner />`, render: () => null, unavailable: true };

const steamSpinnerExample: Example = resolved(SteamSpinner)
  ? {
      title: "SteamSpinner",
      note: 'A full loading-state component (the Steam logo spinner) — children and background="transparent" are its only documented props, plus it spreads SVGAttributes<SVGElement>. Typically used as a full-panel "loading..." placeholder.',
      code: `<SteamSpinner background="transparent">Loading...</SteamSpinner>`,
      render: () => (
        <div style={{ height: 120, position: "relative" }}>
          <SteamSpinner background="transparent">Loading...</SteamSpinner>
        </div>
      ),
    }
  : { title: "SteamSpinner", code: `<SteamSpinner background="transparent">Loading...</SteamSpinner>`, render: () => null, unavailable: true };

const footerLegendNote: Example = {
  title: "FooterLegendProps (not a component)",
  note: "FooterLegend isn't a standalone renderable component — dist/components/FooterLegend.d.ts only exports the GamepadButton/NavEntryPositionPreferences enums and the FooterLegendProps interface. FooterLegendProps is a props mixin (navEntryPreferPosition, preferredFocus, actionDescriptionMap, onOKActionDescription/onCancelActionDescription/onSecondaryActionDescription/onOptionsActionDescription/onMenuActionDescription, and raw onButtonDown/onButtonUp/onOKButton/onCancelButton/... gamepad event handlers) that many other components extend (Menu, MenuItem, Field, DialogButtonProps, Tab, ...) to control the gamepad button-hint footer and raw controller input.",
  code: `<DialogButton
  onOKActionDescription="Confirm"
  onCancelActionDescription="Back"
  onClick={...}
>
  Confirm
</DialogButton>`,
  render: () => (
    <div>
      No standalone component to render — see the note. This is a props
      shape consumed by other components (several of which are demoed
      elsewhere on this page/route).
    </div>
  ),
};

export const feedbackDemo: Demo = {
  id: "feedback",
  title: "Feedback & Status",
  summary: "Progress bars, spinners, and the FooterLegend props mixin for gamepad button hints.",
  docs: (
    <div>
      <p>
        ProgressBar/ProgressBarWithInfo/ProgressBarItem form a small family
        (bare / with extra info text / row-shaped-for-lists) sharing the
        same core indeterminate/nProgress/nTransitionSec props. Spinner and
        SteamSpinner are two different loading indicators — Spinner is a
        small icon-level spinner, SteamSpinner is a bigger, branded
        full-area loading state.
      </p>
    </div>
  ),
  examples: [
    progressBarExample,
    progressBarWithInfoExample,
    progressBarItemExample,
    spinnerExample,
    steamSpinnerExample,
    footerLegendNote,
  ],
};
