import { useState } from "react";
import { SidebarNavigation, Tabs, Navigation, useParams } from "@decky/ui";
import { resolved } from "../framework/types";
import type { Demo, Example } from "../framework/types";

function SidebarNavigationExample() {
  return (
    <div style={{ height: 220, border: "1px solid #444" }}>
      <SidebarNavigation
        title="Example Sidebar"
        pages={[
          { title: "Page One", content: <div style={{ padding: 8 }}>Content of page one</div> },
          { title: "Page Two", content: <div style={{ padding: 8 }}>Content of page two</div> },
          "separator",
          { title: "Page Three", content: <div style={{ padding: 8 }}>Content of page three</div> },
        ]}
      />
    </div>
  );
}

function TabsExample() {
  const [active, setActive] = useState("tab1");
  return (
    <div style={{ height: 160, border: "1px solid #444" }}>
      <Tabs
        activeTab={active}
        onShowTab={(tab: string) => setActive(tab)}
        tabs={[
          { id: "tab1", title: "Tab One", content: <div style={{ padding: 8 }}>Tab one content</div> },
          { id: "tab2", title: "Tab Two", content: <div style={{ padding: 8 }}>Tab two content</div> },
        ]}
      />
    </div>
  );
}

function NavigationExample() {
  const [log, setLog] = useState<string[]>([]);
  const call = (name: string, fn: () => void) => {
    try {
      fn();
      setLog((l) => [...l, `${name}() called`]);
    } catch (e) {
      setLog((l) => [...l, `${name}() threw: ${String(e)}`]);
    }
  };
  return (
    <div>
      <p>
        Not actually navigating away from this demo page — logging the call
        instead so the page stays intact.
      </p>
      <button
        onClick={() =>
          call("Navigation.Navigate", () => console.log("Would call Navigation.Navigate('/some/route')"))
        }
      >
        Log Navigation.Navigate("/some/route")
      </button>
      <ul>
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

function UseParamsExample() {
  let params: unknown;
  try {
    params = useParams<Record<string, string>>();
  } catch (e) {
    params = `useParams() threw: ${String(e)}`;
  }
  return <pre>{JSON.stringify(params, null, 2)}</pre>;
}

const sidebarNavigationExample: Example = resolved(SidebarNavigation)
  ? {
      title: "SidebarNavigation",
      note: "pages is an array of SidebarNavigationPage ({ title, content, icon?, visible?, hideTitle?, identifier?, route?, link?, padding? }) or the literal string 'separator'. When `route` is set on a page and disableRouteReporting isn't true, SidebarNavigation appears to report the active page back into the URL — this demo route itself uses SidebarNavigation for its own top-level layout (see the sidebar you're using right now, or the in-page tab fallback if SidebarNavigation didn't resolve).",
      code: `<SidebarNavigation
  title="Example Sidebar"
  pages={[
    { title: "Page One", content: <div>Content of page one</div> },
    { title: "Page Two", content: <div>Content of page two</div> },
    "separator",
    { title: "Page Three", content: <div>Content of page three</div> },
  ]}
/>`,
      render: () => <SidebarNavigationExample />,
    }
  : { title: "SidebarNavigation", code: `<SidebarNavigation title="..." pages={[...]} />`, render: () => null, unavailable: true };

const tabsExample: Example = resolved(Tabs)
  ? {
      title: "Tabs",
      note: "Typed as `any` in dist/components/Tabs.d.ts, but the TabsProps interface next to it documents the intended shape: tabs: Tab[] ({ id, title, content, renderTabAddon?, footer? }), activeTab: string, onShowTab: (tab: string) => void, autoFocusContents?: boolean. It's a controlled component — you own the active-tab state.",
      code: `const [active, setActive] = useState("tab1");
<Tabs
  activeTab={active}
  onShowTab={setActive}
  tabs={[
    { id: "tab1", title: "Tab One", content: <div>Tab one content</div> },
    { id: "tab2", title: "Tab Two", content: <div>Tab two content</div> },
  ]}
/>`,
      render: () => <TabsExample />,
    }
  : { title: "Tabs", code: `<Tabs activeTab={active} onShowTab={setActive} tabs={[...]} />`, render: () => null, unavailable: true };

const navigationExample: Example = resolved(Navigation)
  ? {
      title: "Navigation",
      note: 'A mutable-let module object (export declare let Navigation: Navigation), not a React component — call its methods directly: Navigation.Navigate(path), Navigation.NavigateBack(), Navigation.CloseSideMenus(), Navigation.OpenQuickAccessMenu(tab?), Navigation.NavigateToExternalWeb(url), etc. This is what the QAM panel\'s "Open full demo" button uses to jump to this full-screen route.',
      code: `Navigation.Navigate("/decky-components-demo");
Navigation.CloseSideMenus();`,
      render: () => <NavigationExample />,
    }
  : { title: "Navigation", code: `Navigation.Navigate("/decky-components-demo"); Navigation.CloseSideMenus();`, render: () => null, unavailable: true };

const routerHookNote: Example = {
  title: "routerHook (from @decky/api, not @decky/ui)",
  note: "routerHook actually comes from the @decky/api package, not @decky/ui — included here for completeness since it's the other half of routing. Call routerHook.addRoute(path, Component, { exact? }) once in definePlugin() to register a full-screen route, and routerHook.removeRoute(path) in onDismount() to clean it up. This plugin registers /decky-components-demo (this very page) that way — see src/index.tsx.",
  code: `import { routerHook } from "@decky/api";

routerHook.addRoute("/decky-components-demo", DemoRoute, { exact: true });
// ...later, in onDismount():
routerHook.removeRoute("/decky-components-demo");`,
  render: () => (
    <div>
      Documentation only — routerHook isn't a @decky/ui export and adding a
      second live route from inside a demo page would be redundant with how
      this very page got here.
    </div>
  ),
};

const useParamsExample: Example = resolved(useParams)
  ? {
      title: "useParams",
      note: "useParams<T>() reads route params for the current route (React Router-style), presumably for routes registered with param placeholders via routerHook.addRoute. This demo route was registered without any params, so the result below is expected to be empty/undefined — that's the useParams call actually running, not a fallback.",
      code: `const params = useParams<{ id?: string }>();`,
      render: () => <UseParamsExample />,
    }
  : { title: "useParams", code: `const params = useParams<{ id?: string }>();`, render: () => null, unavailable: true };

export const navigationDemo: Demo = {
  id: "navigation",
  title: "Navigation & Routing",
  summary: "SidebarNavigation and Tabs for in-page navigation; Navigation, routerHook and useParams for app-level routing.",
  docs: (
    <div>
      <p>
        Two different layers: <b>SidebarNavigation</b>/<b>Tabs</b> are React
        components for navigating between panes within a page you already
        own. <b>Navigation</b> (a @decky/ui module) and <b>routerHook</b> (a
        @decky/api export) are how you move between and register entire
        full-screen routes.
      </p>
    </div>
  ),
  examples: [
    sidebarNavigationExample,
    tabsExample,
    navigationExample,
    routerHookNote,
    useParamsExample,
  ],
};
