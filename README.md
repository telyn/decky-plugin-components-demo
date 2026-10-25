# decky/ui Components Demo

A [decky-loader](https://github.com/SteamDeckHomebrew/decky-loader) plugin that demos the components exported by [@decky/ui](https://github.com/SteamDeckHomebrew/decky-frontend-lib), with live examples and the source for each one.

Forked from [SteamDeckHomebrew/decky-plugin-template](https://github.com/SteamDeckHomebrew/decky-plugin-template).

## What it does

- **Quick Access Menu panel** with a short intro, a few QAM-native controls (slider, toggle, progress bar) and a button that opens the full demo.
- **Full-screen demo route** (`/decky-components-demo`) with a side list of demo pages. Each page shows rendered examples next to the code that produced them.
- **Demo pages** cover nine groups: buttons, fields, panels, dialogs, menus, navigation, feedback, media and hooks (`src/demos/`).
- **Demo framework** (`src/framework/`): a page is a `Demo` (id, title, summary, docs, list of `Example`s) rendered by `DemoPage`. Each `Example` has a title, optional note, code snippet and a `render` function.
- **Missing-component handling**: `@decky/ui` resolves its exports by scraping SteamUI at runtime, so a component can be `undefined` on a given Steam build. Examples for such components are marked unavailable instead of being rendered, and rendered examples are wrapped in an `ErrorBoundary`.
- **Browser test harness** (`tests/frontend/harness/`): a Vite app that loads a local Steam install's real SteamUI bundle so the demos can be rendered outside the Steam client.

## Development

Requires Node.js and `pnpm` (v9).

```bash
pnpm i
pnpm run build        # build the plugin frontend to dist/
pnpm run watch        # rebuild on change
pnpm run test:ui:serve  # serve the browser harness
```

The harness reads the SteamUI bundle from the default macOS Steam location; set `STEAMUI_DIR` to a Steam install's `steamui/` directory to use another one.

The `setup`, `build` and `deploy` VS Code tasks in `.vscode/` work as in the upstream template. The plugin has no custom backend binaries; `main.py` only logs load/unload.

For general plugin development and distribution (plugin zip layout, the plugin store, `backend/` conventions) see the [Decky wiki](https://wiki.deckbrew.xyz/en/user-guide/home#plugin-development) and the [decky-plugin-template README](https://github.com/SteamDeckHomebrew/decky-plugin-template#readme).

## License

BSD 3-Clause, see [LICENSE](LICENSE). The original decky-plugin-template licence is retained there.
