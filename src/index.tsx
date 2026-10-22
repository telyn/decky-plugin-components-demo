import { useState } from "react";
import {
  ButtonItem,
  ErrorBoundary,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField,
  ProgressBarItem,
  Navigation,
  staticClasses,
} from "@decky/ui";
import { definePlugin, routerHook } from "@decky/api";
import { FaShip } from "react-icons/fa";
import DemoRoute from "./DemoRoute";

const DEMO_ROUTE = "/decky-components-demo";

function goToFullDemo() {
  // Guarded: Navigation is a @decky/ui module-scraped export and can
  // legitimately be undefined on a given SteamUI build.
  Navigation?.Navigate?.(DEMO_ROUTE);
  Navigation?.CloseSideMenus?.();
}

/**
 * The Quick Access Menu panel content. Kept short: an intro blurb, a button
 * to jump to the full-screen route (all 9 component groups live there),
 * and a couple of genuinely QAM-only components (PanelSection/
 * PanelSectionRow themselves, plus a couple of controls that only really
 * make sense demoed in their native narrow-panel habitat) so this panel
 * isn't just a single button.
 */
function Content() {
  const [sliderValue, setSliderValue] = useState(50);
  const [toggleValue, setToggleValue] = useState(true);

  // PanelSection/PanelSectionRow are about as fundamental as @decky/ui gets
  // — every real decky loader install has them — so this guard is really
  // about tests/frontend/harness's own module-scrape timing (its
  // "wait for chunk quiescence" heuristic doesn't always let SteamUI finish
  // loading every lazy module before boot.ts hands off), not something
  // expected to trigger on an actual device. Guarded anyway so a slow boot
  // in the harness degrades to plain divs instead of crashing outright.
  const Section = PanelSection ?? "div";
  const Row = PanelSectionRow ?? "div";

  return (
    <Section title="decky/ui Components Demo">
      <Row>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          This plugin demos every component in @decky/ui. This panel shows
          a couple of QAM-native controls; the rest live in the full-screen
          demo.
        </div>
      </Row>

      <Row>
        {ButtonItem ? (
          // Wrapped individually: ButtonItem can resolve (be non-undefined)
          // but still throw at render time on a given SteamUI build, and we
          // don't want that taking the rest of this panel down with it.
          <ErrorBoundary>
            <ButtonItem layout="below" onClick={goToFullDemo}>
              Open full component demo
            </ButtonItem>
          </ErrorBoundary>
        ) : (
          <button onClick={goToFullDemo} style={{ width: "100%" }}>
            Open full component demo
          </button>
        )}
      </Row>

      {SliderField && (
        <Row>
          <ErrorBoundary>
            <SliderField
              label="Example slider"
              value={sliderValue}
              min={0}
              max={100}
              step={1}
              showValue
              onChange={setSliderValue}
            />
          </ErrorBoundary>
        </Row>
      )}

      {ToggleField && (
        <Row>
          <ErrorBoundary>
            <ToggleField
              label="Example toggle"
              checked={toggleValue}
              onChange={setToggleValue}
            />
          </ErrorBoundary>
        </Row>
      )}

      {ProgressBarItem && (
        <Row>
          <ErrorBoundary>
            <ProgressBarItem label="Example progress" nProgress={sliderValue} />
          </ErrorBoundary>
        </Row>
      )}
    </Section>
  );
}

export default definePlugin(() => {
  routerHook.addRoute(DEMO_ROUTE, DemoRoute, { exact: true });

  return {
    // The name shown in various decky menus
    name: "decky/ui Components Demo",
    // The element displayed at the top of your plugin's menu
    titleView: (
      <div className={staticClasses?.Title}>decky/ui Components Demo</div>
    ),
    // The content of your plugin's menu
    content: <Content />,
    // The icon displayed in the plugin list
    icon: <FaShip />,
    // The function triggered when your plugin unloads
    onDismount() {
      routerHook.removeRoute(DEMO_ROUTE);
    },
  };
});
