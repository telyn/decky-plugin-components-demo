import { useState } from "react";
import { Carousel, SuspensefulImage, ColorPickerModal, ReorderableList, showModal } from "@decky/ui";
import type { ReorderableEntry } from "@decky/ui";
import { resolved } from "../framework/types";
import type { Demo, Example } from "../framework/types";

function CarouselExample() {
  const items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
  return (
    <div style={{ height: 100 }}>
      <Carousel
        name="example-carousel"
        nNumItems={items.length}
        nItemHeight={80}
        nHeight={100}
        fnItemRenderer={(id: number) => (
          <div
            key={id}
            style={{
              width: 100,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #666",
              marginRight: 8,
            }}
          >
            {items[id]}
          </div>
        )}
      />
    </div>
  );
}

function SuspensefulImageExample() {
  return (
    <SuspensefulImage
      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iODAiPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9IiM0NDQiLz48L3N2Zz4="
      suspenseWidth={120}
      suspenseHeight={80}
      alt="placeholder"
    />
  );
}

function ColorPickerModalExample() {
  const [last, setLast] = useState("");
  const open = () => {
    if (!resolved(showModal) || !resolved(ColorPickerModal)) {
      setLast("showModal/ColorPickerModal not available on this build");
      return;
    }
    try {
      showModal(
        <ColorPickerModal
          title="Pick a color"
          defaultH={200}
          defaultS={50}
          defaultL={50}
          onConfirm={(hsl: string) => setLast(`Confirmed: ${hsl}`)}
          closeModal={() => {}}
        />,
      );
    } catch (e) {
      setLast(`showModal threw: ${String(e)}`);
    }
  };
  return (
    <div>
      <button onClick={open}>Open ColorPickerModal</button>
      {last && <p>{last}</p>}
    </div>
  );
}

function ReorderableListExample() {
  const [entries, setEntries] = useState<ReorderableEntry<unknown>[]>([
    { label: "First", position: 0 },
    { label: "Second", position: 1 },
    { label: "Third", position: 2 },
  ]);
  return <ReorderableList entries={entries} onSave={setEntries} />;
}

const carouselExample: Example = resolved(Carousel)
  ? {
      title: "Carousel",
      note: "Heavily `any`-typed prop surface inferred from source: nNumItems + fnItemRenderer(id) are the core (render item `id` on demand), fnGetId remaps indices to ids, nItemHeight/nItemMarginX/nHeight size things, fnGetColumnWidth/fnUpdateArrows/fnDoesItemTakeFocus are lower-level hooks whose exact contract wasn't confirmed from types alone. Treat this as a best-effort example, not a confirmed-correct one.",
      code: `<Carousel
  name="example-carousel"
  nNumItems={items.length}
  nItemHeight={80}
  nHeight={100}
  fnItemRenderer={(id) => <div key={id}>{items[id]}</div>}
/>`,
      render: () => <CarouselExample />,
    }
  : { title: "Carousel", code: `<Carousel nNumItems={5} fnItemRenderer={(id) => <div key={id}>Item {id}</div>} />`, render: () => null, unavailable: true };

const suspensefulImageExample: Example = resolved(SuspensefulImage)
  ? {
      title: "SuspensefulImage",
      note: "Extends ImgHTMLAttributes<HTMLImageElement> plus suspenseWidth/suspenseHeight — reserves that box size (presumably to avoid layout shift) while the image loads.",
      code: `<SuspensefulImage src="..." suspenseWidth={120} suspenseHeight={80} alt="..." />`,
      render: () => <SuspensefulImageExample />,
    }
  : { title: "SuspensefulImage", code: `<SuspensefulImage src="..." suspenseWidth={120} suspenseHeight={80} />`, render: () => null, unavailable: true };

const colorPickerModalExample: Example = resolved(ColorPickerModal) && resolved(showModal)
  ? {
      title: "ColorPickerModal",
      note: "Meant to be opened via showModal, not rendered inline (it expects a real closeModal callback, normally supplied by the modal host). defaultH/defaultS/defaultL/defaultA are HSL(A) starting values; onConfirm(HSLString) receives the chosen color as a string.",
      code: `showModal(
  <ColorPickerModal
    title="Pick a color"
    defaultH={200} defaultS={50} defaultL={50}
    onConfirm={(hsl) => console.log(hsl)}
  />
);`,
      render: () => <ColorPickerModalExample />,
    }
  : { title: "ColorPickerModal", code: `showModal(<ColorPickerModal title="..." onConfirm={(hsl) => ...} closeModal={...} />)`, render: () => null, unavailable: true };

const reorderableListExample: Example = resolved(ReorderableList)
  ? {
      title: "ReorderableList",
      note: "Generic ReorderableList<T>({ entries, onSave, interactables?, fieldProps?, animate?, disableReordering? }). entries are { label, data?, position }; onSave receives the reordered array. interactables lets you render extra controls (e.g. a delete button) per entry.",
      code: `const [entries, setEntries] = useState([
  { label: "First", position: 0 },
  { label: "Second", position: 1 },
]);
<ReorderableList entries={entries} onSave={setEntries} />`,
      render: () => <ReorderableListExample />,
    }
  : { title: "ReorderableList", code: `<ReorderableList entries={entries} onSave={setEntries} />`, render: () => null, unavailable: true };

export const mediaDemo: Demo = {
  id: "media",
  title: "Media & Misc",
  summary: "Image/carousel display helpers, the color picker modal, and a drag-to-reorder list.",
  docs: (
    <div>
      <p>
        A grab-bag of components that don't fit the other groups. Carousel
        and ReorderableList both have thin/`any`-heavy typings, so their
        examples here lean more heavily on inference from source than
        confirmed documentation — verify against the real Steam Deck
        overlay before depending on edge-case behavior.
      </p>
    </div>
  ),
  examples: [
    carouselExample,
    suspensefulImageExample,
    colorPickerModalExample,
    reorderableListExample,
  ],
};
