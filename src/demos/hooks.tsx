import { useQuickAccessVisible } from "@decky/ui";
import { resolved } from "../framework/types";
import type { Demo, Example } from "../framework/types";

function UseQuickAccessVisibleExample() {
  let visible: unknown;
  try {
    visible = useQuickAccessVisible();
  } catch (e) {
    visible = `threw: ${String(e)}`;
  }
  return <p>useQuickAccessVisible() currently returns: {String(visible)}</p>;
}

const useQuickAccessVisibleExample: Example = resolved(useQuickAccessVisible)
  ? {
      title: "useQuickAccessVisible",
      note: "() => boolean. Presumably tracks whether the Quick Access Menu is currently open — useful for pausing/resuming work in QAM-only components when the panel is hidden. This is the one hook in this group that's safe and cheap to call live, so it's the one example with a live value below; the module-scraping hooks are look-don't-touch.",
      code: `const qamVisible = useQuickAccessVisible();`,
      render: () => <UseQuickAccessVisibleExample />,
    }
  : { title: "useQuickAccessVisible", code: `const qamVisible = useQuickAccessVisible();`, render: () => null, unavailable: true };

const findModuleFamilyDocs: Example = {
  title: "findModule / findModuleExport family",
  note: "Documented only — calling these live from this demo would search real SteamUI webpack modules with a live filter function, which isn't meaningfully demonstrable (and could be slow) inside a component render. From webpack.d.ts: findModule(filter) finds a module by predicate; findModuleByExport / findModuleExport / findModuleDetailsByExport find a module by inspecting its exports (an ExportFilterFn receives (moduleExport, exportName?)); findModuleChild(filter) walks into a found module's structure; findAllModules(filter) returns every match instead of the first; createModuleMapping(filter) builds a Map of id -> module for all matches. This is exactly the mechanism @decky/ui itself uses internally to resolve every component in this demo (see node_modules/@decky/ui/dist/components/*.js) — and why some of those components can legitimately resolve to undefined on a given SteamUI build.",
  code: `import { findModuleExport } from "@decky/ui";

const MyComponent = findModuleExport(
  (e) => typeof e === "function" && e.toString().includes("someUniqueMarkerString")
);`,
  render: () => (
    <div>
      Documented above — not executed live (see note).
    </div>
  ),
};

const staticClassesDocs: Example = {
  title: "staticClasses & class-mapper utils",
  note: "staticClasses (and its siblings quickAccessMenuClasses, gamepadDialogClasses, steamSpinnerClasses, focusRingClasses, ...) are Record<KnownKeyName, string> maps of hashed/minified CSS module class names scraped out of the real SteamUI bundle — staticClasses.Title (used in this plugin's titleView) is a typical example. findClass(id, name) / findClassByName(name) / findClassModule(filter) / unminifyClass(minifiedClass) from class-mapper.ts are the lower-level lookup functions these maps are built from, for when you need a class name that isn't already exposed as one of the named *Classes maps.",
  code: `import { staticClasses } from "@decky/ui";

<div className={staticClasses.Title}>My Plugin</div>`,
  render: () => (
    <div>
      Documented above — see this plugin's own titleView in src/index.tsx
      for staticClasses.Title actually in use.
    </div>
  ),
};

export const hooksDemo: Demo = {
  id: "hooks",
  title: "Hooks & Utils",
  summary: "useQuickAccessVisible, the findModule/findModuleExport family, and the staticClasses/class-mapper utilities.",
  docs: (
    <div>
      <p>
        This group is documentation-first by design (per the plan for this
        demo): the findModule family and class-mapper utilities are the
        internal machinery @decky/ui itself is built on, not something a
        typical plugin UI renders — showing them "in action" would mean
        dumping raw webpack module internals into this page, which isn't a
        meaningful interactive demo. useQuickAccessVisible is the one
        genuinely interactive hook here and gets a live example.
      </p>
    </div>
  ),
  examples: [useQuickAccessVisibleExample, findModuleFamilyDocs, staticClassesDocs],
};
