import {
  Button,
  ButtonItem,
  DialogButton,
  DialogButtonPrimary,
  DialogButtonSecondary,
} from "@decky/ui";
import { resolved } from "../framework/types";
import type { Demo, Example } from "../framework/types";

const buttonItemExample: Example = resolved(ButtonItem)
  ? {
      title: "ButtonItem",
      note: "The standard row-shaped button used inside PanelSection/PanelSectionRow (QAM) and full-page Field-style layouts alike.",
      code: `<ButtonItem layout="below" onClick={() => console.log("clicked")}>
  Click me
</ButtonItem>`,
      render: () => (
        <ButtonItem layout="below" onClick={() => console.log("ButtonItem clicked")}>
          Click me
        </ButtonItem>
      ),
    }
  : { title: "ButtonItem", code: `<ButtonItem layout="below" onClick={...}>Click me</ButtonItem>`, render: () => null, unavailable: true };

const buttonExample: Example = resolved(Button)
  ? {
      title: "Button",
      note: "Button is just DialogButtonProps re-exported under a shorter name (ButtonProps extends DialogButtonProps with nothing added) — inferred from source, not documented upstream.",
      code: `<Button onClick={() => console.log("clicked")}>Plain Button</Button>`,
      render: () => (
        <Button onClick={() => console.log("Button clicked")}>Plain Button</Button>
      ),
    }
  : { title: "Button", code: `<Button onClick={...}>Plain Button</Button>`, render: () => null, unavailable: true };

const dialogButtonExample: Example = resolved(DialogButton)
  ? {
      title: "DialogButton",
      note: "The neutral-styled button used in Dialog/Modal footers and general full-page UI. Accepts DialogButtonProps: onClick, disabled, focusable, noFocusRing, plus raw pointer/touch handlers and FooterLegendProps (action-description overrides for the gamepad footer).",
      code: `<DialogButton onClick={() => console.log("clicked")}>
  Dialog Button
</DialogButton>`,
      render: () => (
        <DialogButton onClick={() => console.log("DialogButton clicked")}>
          Dialog Button
        </DialogButton>
      ),
    }
  : { title: "DialogButton", code: `<DialogButton onClick={...}>Dialog Button</DialogButton>`, render: () => null, unavailable: true };

const dialogButtonPrimaryExample: Example = resolved(DialogButtonPrimary)
  ? {
      title: "DialogButtonPrimary",
      note: "Same props as DialogButton, styled as the emphasised/primary action — typically the rightmost button in a DialogFooter.",
      code: `<DialogButtonPrimary onClick={() => console.log("confirmed")}>
  Confirm
</DialogButtonPrimary>`,
      render: () => (
        <DialogButtonPrimary onClick={() => console.log("Primary clicked")}>
          Confirm
        </DialogButtonPrimary>
      ),
    }
  : { title: "DialogButtonPrimary", code: `<DialogButtonPrimary onClick={...}>Confirm</DialogButtonPrimary>`, render: () => null, unavailable: true };

const dialogButtonSecondaryExample: Example = resolved(DialogButtonSecondary)
  ? {
      title: "DialogButtonSecondary",
      note: "Same props again, styled as the de-emphasised/secondary action (e.g. Cancel).",
      code: `<DialogButtonSecondary onClick={() => console.log("cancelled")}>
  Cancel
</DialogButtonSecondary>`,
      render: () => (
        <DialogButtonSecondary onClick={() => console.log("Secondary clicked")}>
          Cancel
        </DialogButtonSecondary>
      ),
    }
  : { title: "DialogButtonSecondary", code: `<DialogButtonSecondary onClick={...}>Cancel</DialogButtonSecondary>`, render: () => null, unavailable: true };

export const buttonsDemo: Demo = {
  id: "buttons",
  title: "Buttons & Actions",
  summary: "Five ways to render a clickable thing in SteamUI's gamepad-navigable dialog system.",
  docs: (
    <div>
      <p>
        @decky/ui ships several button-shaped components that look similar
        but come from different parts of SteamUI and carry different
        default styling:
      </p>
      <ul>
        <li>
          <b>ButtonItem</b> extends <code>ItemProps</code> (label,
          description, icon, layout, bottomSeparator, ...) — it's the
          "list row with a button in it" shape used throughout QAM panels
          and settings-style pages. Its own props are just{" "}
          <code>onClick?(e: MouseEvent)</code> and{" "}
          <code>disabled?: boolean</code> on top of ItemProps.
        </li>
        <li>
          <b>DialogButton</b>, <b>DialogButtonPrimary</b>,{" "}
          <b>DialogButtonSecondary</b> all share{" "}
          <code>DialogButtonProps</code> (onClick plus the full set of
          pointer/mouse/touch handlers, disabled, focusable, noFocusRing,
          onSubmit, and FooterLegendProps for gamepad footer hints). They
          differ only in visual styling — bare/neutral, primary/emphasised,
          secondary/de-emphasised.
        </li>
        <li>
          <b>Button</b> is, per the type source, literally{" "}
          <code>interface ButtonProps extends DialogButtonProps {"{}"}</code>{" "}
          — an alias with no props added. Inferred from source; not
          documented upstream, so treat this as "probably behaves like
          DialogButton" rather than confirmed.
        </li>
      </ul>
      <p>
        <b>Gotcha:</b> none of these are HTML <code>&lt;button&gt;</code>{" "}
        elements — they're SteamUI's own focus/gamepad-navigable
        components, so plain DOM button semantics (form submission,{" "}
        <code>type="submit"</code>) don't apply unless you wire{" "}
        <code>onSubmit</code> yourself.
      </p>
    </div>
  ),
  examples: [
    buttonItemExample,
    buttonExample,
    dialogButtonExample,
    dialogButtonPrimaryExample,
    dialogButtonSecondaryExample,
  ],
};
