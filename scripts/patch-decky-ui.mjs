#!/usr/bin/env node
// Patches node_modules/@decky/ui/dist to make its module-scraping resilient
// to unexpected real SteamUI exports, for tests/frontend/harness (the
// STEAMUI_DIR-backed dev server that renders real @decky/ui components).
//
// Why a postinstall script instead of `pnpm patch`/patch-package: @decky/ui's
// package.json lists "dist" in its "files" field, but the tarball actually
// published to npm for the versions checked (4.11.0, 4.12.0) does not
// contain a dist/ directory — `pnpm patch` extracts from that tarball, so it
// has nothing under dist/ to diff against. dist/ only appears in
// node_modules after a full `pnpm install` resolves and (re)builds it, which
// happens after any patch-package-style patch would already need to apply.
// A postinstall script that edits the built dist/ files directly sidesteps
// that gap. It's idempotent (checks for its own marker before touching a
// file) so re-running `pnpm install` doesn't double-patch or error.
//
// What it patches, and why: components/*.js resolve real components via
// heuristic string-sniffing over SteamUI's live webpack modules
// (`Object.values(CommonUIModule).find(mod => mod.render.toString().includes(...))`
// and similar). These are unguarded — if any one predicate throws on some
// real export's shape (observed: `.toString()` not returning a plain
// string), the throw happens during ES module evaluation, which aborts
// evaluation of the entire @decky/ui barrel export, not just that one
// component. That makes every component unavailable, not just the one that
// tripped the bug. This patch wraps those lookups in try/catch (matching
// the try/catch @decky/ui's own dist/webpack.js already uses in
// findModuleDetailsByExport) so a bad match resolves to "not found" and
// falls back gracefully instead.
//
// This does not change any component's rendered output or behavior when
// resolution succeeds — only what happens when the heuristic search itself
// throws.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '../node_modules/@decky/ui/dist');
const MARKER = '// [decky-plugin-components-demo patch]';

function patchFile(relPath, transform) {
  const filePath = join(DIST_DIR, relPath);
  if (!existsSync(filePath)) {
    console.warn(`[patch-decky-ui] skipping ${relPath}: not found (is @decky/ui installed?)`);
    return;
  }
  const original = readFileSync(filePath, 'utf8');
  if (original.includes(MARKER)) {
    return; // already patched
  }
  const patched = transform(original);
  if (patched === original) {
    console.warn(`[patch-decky-ui] WARNING: ${relPath} didn't match expected content — skipped. ` +
      `@decky/ui's dist output may have changed; this patch may need updating.`);
    return;
  }
  writeFileSync(filePath, patched, 'utf8');
}

function replaceOrWarn(source, relPath, oldStr, newStr) {
  if (!source.includes(oldStr)) {
    console.warn(`[patch-decky-ui] WARNING: expected string not found in ${relPath}, skipping that replacement:\n  ${oldStr.slice(0, 80)}...`);
    return source;
  }
  return source.replace(oldStr, newStr);
}

patchFile('webpack.js', (src) => {
  src = replaceOrWarn(src, 'webpack.js',
    `export const findModule = (filter) => {
    for (const m of modules.values()) {
        if (m.default && filter(m.default))
            return m.default;
        if (filter(m))
            return m;
    }
};`,
    `${MARKER}
export const findModule = (filter) => {
    for (const m of modules.values()) {
        try {
            if (m.default && filter(m.default))
                return m.default;
            if (filter(m))
                return m;
        }
        catch (e) {
            logger.warn("Webpack filter threw exception: ", e);
        }
    }
};
export const safeFind = (source, pred) => {
    try {
        return Object.values(source ?? {}).find(pred);
    }
    catch (e) {
        logger.warn("safeFind predicate threw, skipping match: ", e);
        return undefined;
    }
};
export const safeFilter = (source, pred) => {
    try {
        return Object.values(source ?? {}).filter(pred);
    }
    catch (e) {
        logger.warn("safeFilter predicate threw, skipping match: ", e);
        return [];
    }
};
export const safeArrFind = (arr, pred) => {
    try {
        return (arr ?? []).find(pred);
    }
    catch (e) {
        logger.warn("safeArrFind predicate threw, skipping match: ", e);
        return undefined;
    }
};`);
  return src;
});

patchFile('components/ButtonItem.js', (src) => {
  src = replaceOrWarn(src, 'ButtonItem.js', `import { CommonUIModule } from '../webpack';`, `${MARKER}\nimport { CommonUIModule, safeFind } from '../webpack';`);
  src = replaceOrWarn(src, 'ButtonItem.js',
    `export const ButtonItem = Object.values(CommonUIModule).find((mod) =>`,
    `export const ButtonItem = safeFind(CommonUIModule, (mod) =>`);
  return src;
});

patchFile('components/Dialog.js', (src) => {
  src = replaceOrWarn(src, 'Dialog.js', `import { CommonUIModule } from '../webpack';`, `${MARKER}\nimport { CommonUIModule, safeFind, safeFilter } from '../webpack';`);
  src = replaceOrWarn(src, 'Dialog.js',
    `const CommonDialogDivs = Object.values(CommonUIModule).filter((m) =>`,
    `const CommonDialogDivs = safeFilter(CommonUIModule, (m) =>`);
  src = replaceOrWarn(src, 'Dialog.js',
    `export const DialogHeader = (MappedDialogDivs.get('DialogHeader') || Object.values(CommonUIModule).find((component) => {`,
    `export const DialogHeader = (MappedDialogDivs.get('DialogHeader') || safeFind(CommonUIModule, (component) => {`);
  src = replaceOrWarn(src, 'Dialog.js',
    `export const DialogButtonPrimary = Object.values(CommonUIModule).find((mod) => mod?.render?.toString?.()?.includes('"DialogButton","_DialogLayout","Primary"'));
export const DialogButtonSecondary = Object.values(CommonUIModule).find((mod) => mod?.render?.toString?.()?.includes('"DialogButton","_DialogLayout","Secondary"'));`,
    `export const DialogButtonPrimary = safeFind(CommonUIModule, (mod) => mod?.render?.toString?.()?.includes('"DialogButton","_DialogLayout","Primary"'));
export const DialogButtonSecondary = safeFind(CommonUIModule, (mod) => mod?.render?.toString?.()?.includes('"DialogButton","_DialogLayout","Secondary"'));`);
  return src;
});

patchFile('components/Dropdown.js', (src) => {
  src = replaceOrWarn(src, 'Dropdown.js', `import { CommonUIModule } from '../webpack';`, `${MARKER}\nimport { CommonUIModule, safeFind } from '../webpack';`);
  src = replaceOrWarn(src, 'Dropdown.js',
    `export const Dropdown = Object.values(CommonUIModule).find((mod) => mod?.prototype?.SetSelectedOption && mod?.prototype?.BuildMenu);`,
    `export const Dropdown = safeFind(CommonUIModule, (mod) => mod?.prototype?.SetSelectedOption && mod?.prototype?.BuildMenu);`);
  src = replaceOrWarn(src, 'Dropdown.js',
    `export const DropdownItemInternal = Object.values(CommonUIModule).find((mod) => mod?.toString && dropdownItemRegex.test(mod.toString()));`,
    `export const DropdownItemInternal = safeFind(CommonUIModule, (mod) => mod?.toString && dropdownItemRegex.test(mod.toString()));`);
  return src;
});

patchFile('components/Menu.js', (src) => {
  src = replaceOrWarn(src, 'Menu.js',
    `import { findModuleByExport, findModuleDetailsByExport, findModuleExport } from '../webpack';`,
    `${MARKER}\nimport { findModuleByExport, findModuleDetailsByExport, findModuleExport, safeFind } from '../webpack';`);
  src = replaceOrWarn(src, 'Menu.js',
    `    Object.values(MenuModule?.[0] ?? {}).find((e) => e?.toString()?.includes?.(\`useId\`) && e?.toString()?.includes?.(\`labelId\`));`,
    `    safeFind(MenuModule?.[0], (e) => e?.toString()?.includes?.(\`useId\`) && e?.toString()?.includes?.(\`labelId\`));`);
  src = replaceOrWarn(src, 'Menu.js',
    `export const MenuGroup = MenuGoupModule && Object.values(MenuGoupModule).find((e) => typeof e == "function" && e?.toString?.()?.includes("bInGamepadUI:"));`,
    `export const MenuGroup = MenuGoupModule && safeFind(MenuGoupModule, (e) => typeof e == "function" && e?.toString?.()?.includes("bInGamepadUI:"));`);
  return src;
});

patchFile('components/Panel.js', (src) => {
  src = replaceOrWarn(src, 'Panel.js', `import { findModuleDetailsByExport } from '../webpack';`, `${MARKER}\nimport { findModuleDetailsByExport, safeFilter } from '../webpack';`);
  src = replaceOrWarn(src, 'Panel.js',
    `export const PanelSectionRow = Object.values(mod).filter((exp) => !exp?.toString?.()?.includes('.PanelSection'))[0];`,
    `export const PanelSectionRow = safeFilter(mod, (exp) => !exp?.toString?.()?.includes('.PanelSection'))[0];`);
  return src;
});

patchFile('components/Scroll.js', (src) => {
  src = replaceOrWarn(src, 'Scroll.js',
    `import { findModuleByExport, findModuleExport } from '../webpack';`,
    `${MARKER}\nimport { findModuleByExport, findModuleExport, safeArrFind } from '../webpack';`);
  src = replaceOrWarn(src, 'Scroll.js',
    `export const ScrollPanel = ScrollingModuleProps.find((prop) => prop?.render?.toString?.().includes('{case"x":'));`,
    `export const ScrollPanel = safeArrFind(ScrollingModuleProps, (prop) => prop?.render?.toString?.().includes('{case"x":'));`);
  return src;
});

patchFile('components/SliderField.js', (src) => {
  src = replaceOrWarn(src, 'SliderField.js', `import { CommonUIModule } from '../webpack';`, `${MARKER}\nimport { CommonUIModule, safeFind } from '../webpack';`);
  src = replaceOrWarn(src, 'SliderField.js',
    `export const SliderField = Object.values(CommonUIModule).find((mod) =>`,
    `export const SliderField = safeFind(CommonUIModule, (mod) =>`);
  return src;
});

patchFile('components/Spinner.js', (src) => {
  src = replaceOrWarn(src, 'Spinner.js', `import { IconsModule } from '../webpack';`, `${MARKER}\nimport { IconsModule, safeFind } from '../webpack';`);
  src = replaceOrWarn(src, 'Spinner.js',
    `export const Spinner = IconsModule && Object.values(IconsModule)?.find((mod) =>`,
    `export const Spinner = IconsModule && safeFind(IconsModule, (mod) =>`);
  return src;
});

patchFile('components/Tabs.js', (src) => {
  src = replaceOrWarn(src, 'Tabs.js', `import { findModuleByExport } from '../webpack';`, `${MARKER}\nimport { findModuleByExport, safeFind } from '../webpack';`);
  src = replaceOrWarn(src, 'Tabs.js',
    `export const Tabs = tabsModule && Object.values(tabsModule).find((e) => e?.type?.toString?.()?.includes("(function()"));`,
    `export const Tabs = tabsModule && safeFind(tabsModule, (e) => e?.type?.toString?.()?.includes("(function()"));`);
  return src;
});

patchFile('components/TextField.js', (src) => {
  src = replaceOrWarn(src, 'TextField.js', `import { CommonUIModule } from '../webpack';`, `${MARKER}\nimport { CommonUIModule, safeFind } from '../webpack';`);
  src = replaceOrWarn(src, 'TextField.js',
    `export const TextField = Object.values(CommonUIModule).find((mod) => mod?.validateUrl && mod?.validateEmail);`,
    `export const TextField = safeFind(CommonUIModule, (mod) => mod?.validateUrl && mod?.validateEmail);`);
  return src;
});

patchFile('components/Toggle.js', (src) => {
  src = replaceOrWarn(src, 'Toggle.js', `import { CommonUIModule } from '../webpack';`, `${MARKER}\nimport { CommonUIModule, safeFind } from '../webpack';`);
  src = replaceOrWarn(src, 'Toggle.js',
    `export const Toggle = Object.values(CommonUIModule).find((mod) => mod?.render?.toString?.()?.includes('.ToggleOff)'));`,
    `export const Toggle = safeFind(CommonUIModule, (mod) => mod?.render?.toString?.()?.includes('.ToggleOff)'));`);
  return src;
});

patchFile('components/ToggleField.js', (src) => {
  src = replaceOrWarn(src, 'ToggleField.js', `import { CommonUIModule } from '../webpack';`, `${MARKER}\nimport { CommonUIModule, safeFind } from '../webpack';`);
  src = replaceOrWarn(src, 'ToggleField.js',
    `export const ToggleField = Object.values(CommonUIModule).find((mod) =>`,
    `export const ToggleField = safeFind(CommonUIModule, (mod) =>`);
  return src;
});

patchFile('components/Modal.js', (src) => {
  src = replaceOrWarn(src, 'Modal.js',
    `import { findModule, findModuleDetailsByExport, findModuleExport } from '../webpack';`,
    `${MARKER}\nimport { findModule, findModuleDetailsByExport, findModuleExport, safeFind, safeArrFind } from '../webpack';`);
  src = replaceOrWarn(src, 'Modal.js',
    `    Object.values(findModule((m) => {
        if (typeof m !== 'object')
            return false;
        for (let prop in m) {
            if (m[prop]?.m_mapModalManager && Object.values(m)?.find((x) => x?.type)) {
                return true;
            }
        }
        return false;
    }) || {})?.find((x) => x?.type?.toString?.()?.includes('((function(){'));`,
    `    safeFind(findModule((m) => {
        if (typeof m !== 'object')
            return false;
        for (let prop in m) {
            if (m[prop]?.m_mapModalManager && Object.values(m)?.find((x) => x?.type)) {
                return true;
            }
        }
        return false;
    }), (x) => x?.type?.toString?.()?.includes('((function(){'));`);
  src = replaceOrWarn(src, 'Modal.js',
    `export const SimpleModal = ModalModuleProps.find((prop) => {`,
    `export const SimpleModal = safeArrFind(ModalModuleProps, (prop) => {`);
  return src;
});

patchFile('utils/react/react.js', (src) => {
  src = replaceOrWarn(src, 'react.js',
    `export let INTERNAL_HOOKS = window.SP_REACT?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher
    .current || Object.values(window.SP_REACT?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE).find((p) => p?.useEffect);`,
    `${MARKER}
// Original threw if window.SP_REACT (or its internals) were missing/shaped
// differently than expected: ".current" was accessed without optional
// chaining, and Object.values() was called on a possibly-undefined value.
export let INTERNAL_HOOKS = (() => {
    try {
        return (window.SP_REACT?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher
            ?.current || Object.values(window.SP_REACT?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ?? {}).find((p) => p?.useEffect));
    }
    catch (e) {
        console.warn('[@decky/ui] failed to resolve INTERNAL_HOOKS from window.SP_REACT:', e);
        return undefined;
    }
})();`);
  return src;
});

patchFile('deck-hooks/useParams.js', (src) => {
  src = replaceOrWarn(src, 'useParams.js', `import { ReactRouter } from '../webpack';`, `${MARKER}\nimport { ReactRouter, safeFind } from '../webpack';`);
  src = replaceOrWarn(src, 'useParams.js',
    `export const useParams = Object.values(ReactRouter).find((val) => /return (\\w)\\?\\1\\.params:{}/.test(\`\${val}\`));`,
    `export const useParams = safeFind(ReactRouter, (val) => /return (\\w)\\?\\1\\.params:{}/.test(\`\${val}\`));`);
  return src;
});

patchFile('modules/Router.js', (src) => {
  src = replaceOrWarn(src, 'Router.js',
    `        NavigateToLayoutPreview: Router.NavigateToLayoutPreview?.bind(Router),`,
    `        ${MARKER}
        // Original unguarded (Router.NavigateToLayoutPreview — no leading
        // "?."), so when Router itself doesn't resolve (findModuleExport
        // returns undefined — observed on this SteamUI build), building
        // this object literal throws, which the surrounding try/catch
        // turns into "Error initializing Navigation interface" — aborting
        // ALL of Navigation, including Navigate/CloseSideMenus, which don't
        // even depend on Router at construction time.
        NavigateToLayoutPreview: Router?.NavigateToLayoutPreview?.bind(Router),`);
  src = replaceOrWarn(src, 'Router.js',
    `        OpenPowerMenu: Router.OpenPowerMenu?.bind(Router),`,
    `        OpenPowerMenu: Router?.OpenPowerMenu?.bind(Router),`);
  return src;
});

console.log('[patch-decky-ui] done.');
