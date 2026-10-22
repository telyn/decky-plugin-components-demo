import { useState } from "react";
import { Menu, MenuGroup, MenuItem, MenuSeparator, showContextMenu } from "@decky/ui";
import { resolved } from "../framework/types";
import type { Demo, Example } from "../framework/types";

function MenuStructureExample() {
  return (
    <div style={{ border: "1px solid #444", width: 220 }}>
      {Menu && (
        <Menu label="Example Menu">
          {MenuItem && <MenuItem onSelected={() => console.log("Item 1")}>Item 1</MenuItem>}
          {MenuItem && <MenuItem onSelected={() => console.log("Item 2")}>Item 2</MenuItem>}
          {MenuSeparator && <MenuSeparator />}
          {MenuGroup && (
            <MenuGroup label="A Group">
              {MenuItem && (
                <MenuItem onSelected={() => console.log("Grouped item")}>
                  Grouped item
                </MenuItem>
              )}
            </MenuGroup>
          )}
        </Menu>
      )}
    </div>
  );
}

function ShowContextMenuExample() {
  const [lastResult, setLastResult] = useState("");
  const open = (e: React.MouseEvent) => {
    if (!resolved(showContextMenu) || !resolved(Menu) || !resolved(MenuItem)) {
      setLastResult("showContextMenu/Menu/MenuItem not available on this build");
      return;
    }
    try {
      showContextMenu(
        <Menu label="Context Menu">
          <MenuItem onSelected={() => setLastResult("Option A selected")}>
            Option A
          </MenuItem>
          <MenuItem onSelected={() => setLastResult("Option B selected")}>
            Option B
          </MenuItem>
        </Menu>,
        e.currentTarget as EventTarget,
      );
    } catch (err) {
      setLastResult(`showContextMenu threw: ${String(err)}`);
    }
  };
  return (
    <div>
      <button onClick={open}>Right-click-style menu (click me)</button>
      {lastResult && <p>Last result: {lastResult}</p>}
    </div>
  );
}

const menuStructureExample: Example = resolved(Menu)
  ? {
      title: "Menu / MenuGroup / MenuItem / MenuSeparator",
      note: "Menu (label, onCancel, cancelText + FooterLegendProps) is the outer container, usually passed straight to showContextMenu rather than rendered inline. MenuItem's onSelected(evt) fires on confirm; onClick also exists separately in the type and its relationship to onSelected is not confirmed from source. MenuGroup nests a labelled, collapsible-looking group; MenuSeparator takes no props.",
      code: `<Menu label="Example Menu">
  <MenuItem onSelected={() => ...}>Item 1</MenuItem>
  <MenuItem onSelected={() => ...}>Item 2</MenuItem>
  <MenuSeparator />
  <MenuGroup label="A Group">
    <MenuItem onSelected={() => ...}>Grouped item</MenuItem>
  </MenuGroup>
</Menu>`,
      render: () => <MenuStructureExample />,
    }
  : { title: "Menu / MenuGroup / MenuItem / MenuSeparator", code: `<Menu label="...">...</Menu>`, render: () => null, unavailable: true };

const showContextMenuExample: Example = resolved(showContextMenu) && resolved(Menu) && resolved(MenuItem)
  ? {
      title: "showContextMenu",
      note: "showContextMenu(children, parent?, options?) pops a Menu up near/relative to `parent` (an EventTarget, typically the clicked element), similar to a native right-click menu. options (ContextMenuPositionOptions) control positioning/sizing behavior (bMatchWidth, bPreferPopTop, bScreenCoordinates, etc.) — a large undocumented surface, use defaults unless you have a specific layout problem.",
      code: `showContextMenu(
  <Menu label="Context Menu">
    <MenuItem onSelected={() => ...}>Option A</MenuItem>
    <MenuItem onSelected={() => ...}>Option B</MenuItem>
  </Menu>,
  event.currentTarget,
);`,
      render: () => <ShowContextMenuExample />,
    }
  : { title: "showContextMenu", code: `showContextMenu(<Menu label="...">...</Menu>, event.currentTarget)`, render: () => null, unavailable: true };

export const menusDemo: Demo = {
  id: "menus",
  title: "Menus",
  summary: "Context/popup menu components — Menu, its items/groups/separators, and showContextMenu to pop one up.",
  docs: (
    <div>
      <p>
        Menu is the container, MenuItem/MenuGroup/MenuSeparator are its
        children, and showContextMenu is what actually mounts a Menu as a
        floating popup (the same way showModal mounts a modal). Rendering a
        Menu inline without showContextMenu (as in the first example below)
        shows its structure/styling but not its real popup positioning
        behavior.
      </p>
    </div>
  ),
  examples: [menuStructureExample, showContextMenuExample],
};
