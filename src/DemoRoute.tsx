import { useState } from "react";
import { DemoPage } from "./framework/DemoPage";
import type { Demo } from "./framework/types";
import { buttonsDemo } from "./demos/buttons";
import { fieldsDemo } from "./demos/fields";
import { panelsDemo } from "./demos/panels";
import { dialogsDemo } from "./demos/dialogs";
import { menusDemo } from "./demos/menus";
import { navigationDemo } from "./demos/navigation";
import { feedbackDemo } from "./demos/feedback";
import { mediaDemo } from "./demos/media";
import { hooksDemo } from "./demos/hooks";

const demos: Demo[] = [
  buttonsDemo,
  fieldsDemo,
  panelsDemo,
  dialogsDemo,
  menusDemo,
  navigationDemo,
  feedbackDemo,
  mediaDemo,
  hooksDemo,
];

// SidebarNavigation is deliberately NOT used here, even though it resolves
// on the SteamUI builds this has been checked against. In the
// tests/frontend/harness environment it reaches into SteamUI's real Router
// module during mount (to sync the active page into browser history —
// disableRouteReporting doesn't fully opt out of this) and needs a
// genuinely registered window/location that only exists once decky loader
// (or a real Steam session) opens one. Multiple distinct internal crashes
// were observed chasing this (a `.location` read, then a `.render` call on
// a corrupted fiber during React's own error recovery) — this isn't one
// fixable bug, it's this harness lacking Steam window state SidebarNavigation
// assumes exists. It would presumably work fine under the real decky
// loader, which does provide that context, but that's unverified here.
//
// This plain list nav is what the full-screen route actually uses, so it's
// what you'll see whether or not SidebarNavigation itself resolves.
export default function DemoRoute() {
  const [activeId, setActiveId] = useState<string>(demos[0].id);
  const active = demos.find((d) => d.id === activeId) ?? demos[0];

  return (
    <div style={{ display: "flex", height: "100%", minHeight: "100vh" }}>
      <nav
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.15)",
          padding: 8,
        }}
      >
        {demos.map((demo) => (
          <div
            key={demo.id}
            onClick={() => setActiveId(demo.id)}
            style={{
              padding: "8px 10px",
              cursor: "pointer",
              borderRadius: 4,
              marginBottom: 2,
              background:
                demo.id === active.id ? "rgba(255,255,255,0.12)" : "transparent",
            }}
          >
            {demo.title}
          </div>
        ))}
      </nav>
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <DemoPage demo={active} />
      </div>
    </div>
  );
}
