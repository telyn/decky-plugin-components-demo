import { useState } from "react";
import {
  DialogHeader,
  DialogSubHeader,
  DialogFooter,
  DialogLabel,
  DialogBodyText,
  DialogBody,
  DialogControlsSection,
  DialogControlsSectionHeader,
  DialogButtonPrimary,
  SimpleModal,
  ConfirmModal,
  ModalRoot,
  showModal,
} from "@decky/ui";
import { resolved } from "../framework/types";
import type { Demo, Example } from "../framework/types";

function DialogPartsExample() {
  return (
    <div style={{ border: "1px solid #444", padding: 12 }}>
      {DialogHeader && <DialogHeader>Dialog Header</DialogHeader>}
      {DialogSubHeader && <DialogSubHeader>Dialog Sub Header</DialogSubHeader>}
      {DialogBody && (
        <DialogBody>
          {DialogControlsSection && (
            <DialogControlsSection>
              {DialogControlsSectionHeader && (
                <DialogControlsSectionHeader>
                  Section Header
                </DialogControlsSectionHeader>
              )}
              {DialogLabel && <DialogLabel>A label</DialogLabel>}
              {DialogBodyText && (
                <DialogBodyText>Some body text explaining something.</DialogBodyText>
              )}
            </DialogControlsSection>
          )}
        </DialogBody>
      )}
      {DialogFooter && DialogButtonPrimary && (
        <DialogFooter>
          <DialogButtonPrimary onClick={() => console.log("ok")}>
            OK
          </DialogButtonPrimary>
        </DialogFooter>
      )}
    </div>
  );
}

function ShowModalExample() {
  const [lastResult, setLastResult] = useState<string>("");
  const open = () => {
    if (!resolved(showModal) || !resolved(ConfirmModal)) {
      setLastResult("showModal/ConfirmModal not available on this build");
      return;
    }
    try {
      showModal(
        <ConfirmModal
          strTitle="Example Modal"
          strDescription="This modal was opened with showModal()."
          onOK={() => setLastResult("OK pressed")}
          onCancel={() => setLastResult("Cancelled")}
        />,
      );
    } catch (e) {
      setLastResult(`showModal threw: ${String(e)}`);
    }
  };
  return (
    <div>
      <button onClick={open}>Open a ConfirmModal via showModal()</button>
      {lastResult && <p>Last result: {lastResult}</p>}
    </div>
  );
}

const dialogPartsExample: Example = resolved(DialogHeader || DialogBody)
  ? {
      title: "Dialog building blocks",
      note: "DialogHeader/DialogSubHeader/DialogFooter/DialogLabel/DialogBodyText/DialogBody/DialogControlsSection/DialogControlsSectionHeader are all thin styled wrapper divs (DialogCommonProps: style/className/children/ref) meant to be composed inside a Modal or ConfirmModal's children. Rendered here outside a real modal purely to show their styling.",
      code: `<DialogHeader>Dialog Header</DialogHeader>
<DialogBody>
  <DialogControlsSection>
    <DialogControlsSectionHeader>Section Header</DialogControlsSectionHeader>
    <DialogLabel>A label</DialogLabel>
    <DialogBodyText>Some body text.</DialogBodyText>
  </DialogControlsSection>
</DialogBody>
<DialogFooter>
  <DialogButtonPrimary onClick={...}>OK</DialogButtonPrimary>
</DialogFooter>`,
      render: () => <DialogPartsExample />,
    }
  : { title: "Dialog building blocks", code: `<DialogHeader>...</DialogHeader>`, render: () => null, unavailable: true };

const modalExample: Example = resolved(SimpleModal)
  ? {
      title: "Modal (SimpleModal)",
      note: "@decky/ui doesn't actually export a component literally named `Modal` — dist/components/Modal.d.ts only has showModal, ConfirmModal, ModalRoot, SimpleModal and ModalPosition. SimpleModal (active + children) is the closest 'bare Modal' primitive: a simple show/hide wrapper, lower-level than ConfirmModal and without its OK/Cancel chrome. Usage beyond the type signature (active/children) is unconfirmed from source.",
      code: `<SimpleModal active={isOpen}>
  <div>Modal content</div>
</SimpleModal>`,
      render: () => (
        <SimpleModal active>
          <div style={{ padding: 8, border: "1px solid #666" }}>
            SimpleModal content (active)
          </div>
        </SimpleModal>
      ),
    }
  : { title: "Modal (SimpleModal)", code: `<SimpleModal active={isOpen}><div>Modal content</div></SimpleModal>`, render: () => null, unavailable: true };

const confirmModalExample: Example = resolved(ConfirmModal) && resolved(showModal)
  ? {
      title: "ConfirmModal + showModal",
      note: "showModal(modal, parent?, props?) mounts a ReactNode into a real SteamUI popup window and returns { Close, Update }. ConfirmModal is the standard OK/Cancel(/Middle) modal shape: strTitle, strDescription, strOKButtonText, strCancelButtonText, strMiddleButtonText, onOK/onCancel/onMiddleButton, bAlertDialog, bMiddleDisabled.",
      code: `showModal(
  <ConfirmModal
    strTitle="Example Modal"
    strDescription="This modal was opened with showModal()."
    onOK={() => ...}
    onCancel={() => ...}
  />
);`,
      render: () => <ShowModalExample />,
    }
  : { title: "ConfirmModal + showModal", code: `showModal(<ConfirmModal strTitle="..." strDescription="..." onOK={...} onCancel={...} />)`, render: () => null, unavailable: true };

const modalRootExample: Example = resolved(ModalRoot)
  ? {
      title: "ModalRoot",
      note: "Typed as `any` in the .d.ts — it's the lower-level modal chrome (close icon, OK/Cancel wiring, bAllowFullSize / bDestructiveWarning / bDisableBackgroundDismiss / bHideCloseIcon flags per ModalRootProps) that ConfirmModal is built on. Prefer ConfirmModal or showModal for typical use; drop to ModalRoot only for custom modal chrome. Not demoed live — safe usage requires more of ModalRootProps' internal wiring than could be confirmed from types alone.",
      code: `// Lower-level than ConfirmModal — build custom modal chrome with ModalRootProps
// (children, onCancel, onOK, bAllowFullSize, bDestructiveWarning, ...)`,
      render: () => <div>ModalRoot export is present on this build.</div>,
    }
  : { title: "ModalRoot", code: `// ModalRoot`, render: () => null, unavailable: true };

export const dialogsDemo: Demo = {
  id: "dialogs",
  title: "Dialogs & Modals",
  summary: "The Dialog* styling primitives, plus the Modal/ConfirmModal/showModal stack for popup windows.",
  docs: (
    <div>
      <p>
        Two separate concerns live here: the <b>Dialog*</b> components
        (DialogHeader, DialogBody, DialogFooter, ...) are just styled
        wrapper elements for laying out content — they don't open anything
        by themselves. <b>Modal</b>/<b>ConfirmModal</b>/<b>ModalRoot</b> and{" "}
        <b>showModal</b> are what actually creates a popup window and
        mounts content into it.
      </p>
      <p>
        <b>Gotcha:</b> <code>showModal</code> opens a real SteamUI popup
        window (potentially a separate OS-level window depending on{" "}
        <code>bForcePopOut</code>/<code>bNeverPopOut</code>), which behaves
        differently in a plain browser test harness than inside the actual
        Steam Deck overlay — test it in the real overlay before relying on
        its behavior.
      </p>
    </div>
  ),
  examples: [
    dialogPartsExample,
    modalExample,
    confirmModalExample,
    modalRootExample,
  ],
};
