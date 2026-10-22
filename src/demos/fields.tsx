import { useState } from "react";
import {
  Field,
  TextField,
  SliderField,
  ToggleField,
  Toggle,
  Dropdown,
  DialogCheckbox,
} from "@decky/ui";
import { resolved } from "../framework/types";
import type { Demo, Example } from "../framework/types";

function FieldExample() {
  return (
    <Field label="A label" description="A description under the label">
      Child content
    </Field>
  );
}

function TextFieldExample() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label="Your name"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

function SliderFieldExample() {
  const [value, setValue] = useState(50);
  return (
    <SliderField
      label="Volume"
      value={value}
      min={0}
      max={100}
      step={1}
      showValue
      onChange={setValue}
    />
  );
}

function ToggleFieldExample() {
  const [checked, setChecked] = useState(false);
  return (
    <ToggleField
      label="Enable feature"
      checked={checked}
      onChange={setChecked}
    />
  );
}

function ToggleExample() {
  const [value, setValue] = useState(false);
  return <Toggle value={value} onChange={setValue} />;
}

function DropdownExample() {
  const [selected, setSelected] = useState<any>({ data: 1, label: "One" });
  return (
    <Dropdown
      rgOptions={[
        { data: 1, label: "One" },
        { data: 2, label: "Two" },
        { data: 3, label: "Three" },
      ]}
      selectedOption={selected.data}
      onChange={setSelected}
    />
  );
}

function DialogCheckboxExample() {
  const [checked, setChecked] = useState(false);
  return (
    <DialogCheckbox
      label="I agree"
      checked={checked}
      onChange={setChecked}
    />
  );
}

const fieldExample: Example = resolved(Field)
  ? {
      title: "Field",
      note: "The generic label+description+children row. Almost every other *Field component (ToggleField, SliderField, DropdownItem, ...) is built on the same Item/Field visual language.",
      code: `<Field label="A label" description="A description under the label">
  Child content
</Field>`,
      render: () => <FieldExample />,
    }
  : { title: "Field", code: `<Field label="..." description="...">Child content</Field>`, render: () => null, unavailable: true };

const textFieldExample: Example = resolved(TextField)
  ? {
      title: "TextField",
      note: 'Extends HTMLAttributes<HTMLInputElement>. Has built-in affordances via bShowCopyAction / bShowClearAction / bAlwaysShowClearAction / bIsPassword, and light validation flags (mustBeNumeric, mustBeURL, mustBeEmail, rangeMin/rangeMax) — inferred from types; unclear from source whether these validations block onChange or just decorate the field.',
      code: `const [value, setValue] = useState("");
<TextField label="Your name" value={value} onChange={(e) => setValue(e.target.value)} />`,
      render: () => <TextFieldExample />,
    }
  : { title: "TextField", code: `<TextField label="Your name" value={value} onChange={...} />`, render: () => null, unavailable: true };

const sliderFieldExample: Example = resolved(SliderField)
  ? {
      title: "SliderField",
      note: "Extends ItemProps. value/onChange are controlled. notchCount/notchLabels/notchTicksVisible drive discrete stops; editableValue lets the user type a value directly when showValue is set.",
      code: `const [value, setValue] = useState(50);
<SliderField label="Volume" value={value} min={0} max={100} step={1} showValue onChange={setValue} />`,
      render: () => <SliderFieldExample />,
    }
  : { title: "SliderField", code: `<SliderField label="Volume" value={value} min={0} max={100} onChange={setValue} />`, render: () => null, unavailable: true };

const toggleFieldExample: Example = resolved(ToggleField)
  ? {
      title: "ToggleField",
      note: "Label+description row wrapping a Toggle. checked/onChange are required-ish (checked is required in the type).",
      code: `const [checked, setChecked] = useState(false);
<ToggleField label="Enable feature" checked={checked} onChange={setChecked} />`,
      render: () => <ToggleFieldExample />,
    }
  : { title: "ToggleField", code: `<ToggleField label="Enable feature" checked={checked} onChange={setChecked} />`, render: () => null, unavailable: true };

const toggleExample: Example = resolved(Toggle)
  ? {
      title: "Toggle",
      note: "The bare switch control with no label/description — use this when you're building your own row layout instead of ToggleField's.",
      code: `const [value, setValue] = useState(false);
<Toggle value={value} onChange={setValue} />`,
      render: () => <ToggleExample />,
    }
  : { title: "Toggle", code: `<Toggle value={value} onChange={setValue} />`, render: () => null, unavailable: true };

const dropdownExample: Example = resolved(Dropdown)
  ? {
      title: "Dropdown",
      note: "rgOptions is a flat or nested list of { data, label } / { label, options } (for submenus). selectedOption is matched against each option's data, not the option object itself. There's also a DropdownItem (Dropdown + ItemProps) for a labelled row version — not separately demoed here.",
      code: `<Dropdown
  rgOptions={[{ data: 1, label: "One" }, { data: 2, label: "Two" }]}
  selectedOption={1}
  onChange={(opt) => console.log(opt)}
/>`,
      render: () => <DropdownExample />,
    }
  : { title: "Dropdown", code: `<Dropdown rgOptions={[...]} selectedOption={1} onChange={...} />`, render: () => null, unavailable: true };

const dialogCheckboxExample: Example = resolved(DialogCheckbox)
  ? {
      title: "DialogCheckbox",
      note: "A checkbox styled for use inside Dialog/Modal bodies, distinct from ToggleField's switch look. Supports controlled (checked+onChange) or uncontrolled (controlled=false) usage per the type, though only controlled usage has been visually verified here.",
      code: `const [checked, setChecked] = useState(false);
<DialogCheckbox label="I agree" checked={checked} onChange={setChecked} />`,
      render: () => <DialogCheckboxExample />,
    }
  : { title: "DialogCheckbox", code: `<DialogCheckbox label="I agree" checked={checked} onChange={setChecked} />`, render: () => null, unavailable: true };

export const fieldsDemo: Demo = {
  id: "fields",
  title: "Fields & Inputs",
  summary: "Labelled input rows (Field-family) plus the bare controls they wrap.",
  docs: (
    <div>
      <p>
        Most of these share a common shape: a <code>label</code> +{" "}
        <code>description</code> row (from <code>ItemProps</code> /{" "}
        <code>FooterLegendProps</code>) wrapping a control. The bare
        controls (Toggle) exist separately from their Field wrapper
        (ToggleField) for when you want to lay out the label yourself.
      </p>
      <p>
        <b>Gotcha:</b> several of these (SliderField, ToggleField) are
        controlled-only — there's no internal state fallback, so a missing{" "}
        <code>onChange</code> means the control visually can't move even
        though it isn't disabled.
      </p>
    </div>
  ),
  examples: [
    fieldExample,
    textFieldExample,
    sliderFieldExample,
    toggleFieldExample,
    toggleExample,
    dropdownExample,
    dialogCheckboxExample,
  ],
};
