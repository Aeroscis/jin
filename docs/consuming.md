# Consuming Jin from an application

This is the practical guide for wiring the library into a Vue 3 + Vite application. It exists
because the two things that go wrong — a second Vue instance and a dev server that refuses to serve
the library — produce confusing symptoms rather than clear errors.

---

## 1. Add the dependency

Prefer a workspace entry if the application and the library already share a repository root;
otherwise a `file:` path works.

```jsonc
// package.json
{
  "dependencies": {
    "jin-ui": "file:../jin"
  }
}
```

With npm, a `file:` dependency on a local directory becomes a symlink. That is what you want: edits
to the library appear in the application immediately.

**Do not** add `vue` to the library's own `dependencies`. It is a peer dependency, and a second copy
is the single most confusing failure mode this setup has.

## 2. Configure Vite

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // Mandatory. See "Symptoms" below for what happens without it.
    dedupe: ['vue'],
    // Optional: point straight at the sources so you never depend on the
    // library's own build output during development.
    alias: [
      // Sub-path aliases must come before the bare package alias.
      { find: 'jin-ui/styles', replacement: fileURLToPath(new URL('../jin/src/styles/jin.css', import.meta.url)) },
      { find: 'jin-ui/themes', replacement: fileURLToPath(new URL('../jin/themes', import.meta.url)) },
      { find: 'jin-ui/contracts', replacement: fileURLToPath(new URL('../jin/contracts', import.meta.url)) },
      { find: 'jin-ui', replacement: fileURLToPath(new URL('../jin/src/index.ts', import.meta.url)) },
    ],
  },
  server: {
    fs: {
      // Mandatory when the library is outside the app root: the dev server
      // only serves files under the project root by default.
      allow: [fileURLToPath(new URL('..', import.meta.url))],
    },
  },
})
```

The alias ordering point is not cosmetic. A bare string alias matches at a path boundary, so
`jin-ui` listed first swallows `jin-ui/themes/...` and Vite resolves it *inside the library entry
file*, producing a "failed to resolve import" error that points at the wrong file.

## 3. Install the plugin

```ts
// main.ts
import { createApp } from 'vue'
import { JinUI } from 'jin-ui'

// The base sheet first, then the themes. A theme only sets custom properties,
// so it must come after the sheet that consumes them.
import 'jin-ui/styles'
import 'jin-ui/themes/jin.css'
import 'jin-ui/themes/jin.dark.css'

import App from './App.vue'

const app = createApp(App)

app.use(JinUI, {
  t: (key, vars) => i18n.t(key, vars),
  capabilities: {
    pickFolder: async () => {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const result = await open({ directory: true })
      return typeof result === 'string' ? result : null
    },
    openExternal: async (url) => {
      const { openUrl } = await import('@tauri-apps/plugin-opener')
      await openUrl(url)
    },
  },
  theme: {
    defaultStyle: 'jin',
    defaultMode: 'light',
    onChange: (snapshot) => {
      localStorage.setItem('jin.style', snapshot.style)
      localStorage.setItem('jin.mode', snapshot.mode)
    },
  },
})

app.mount('#app')
```

### Translating the library's strings

The library declares exactly which keys it needs in `contracts/strings.json`. If the application's
dictionary is keyed by source text rather than by key, write a mapping and pass it in — that mapping
belongs in the application, because only the application knows what its own keys look like:

```ts
const JIN_KEYS: Record<string, string> = {
  'a11y.close': '关闭',
  'a11y.expand': '展开',
  'a11y.collapse': '折叠',
  'empty.noData': '暂无数据',
  // …
}

app.use(JinUI, {
  t: (key, vars) => {
    const translated = JIN_KEYS[key]
    if (translated) return translated
    // Fall back to the application's own dictionary before the library default.
    return i18n.t(key, vars)
  },
})
```

The library never throws on an unknown key and never renders a raw key into the interface.

### Capabilities and graceful degradation

A capability that is absent is not an error. `JinLink` renders a normal anchor when `openExternal`
is missing, and any control that would offer "Browse…" hides that affordance entirely. This is how
one component set serves both a Tauri application and a plain browser page.

## 4. Mount the message hosts once

```vue
<!-- App.vue -->
<template>
  <RouterView />
  <JinToastRegion />
  <JinNotificationRegion />
</template>
```

Mount them exactly once, at the application root. Mounting a region twice renders every message
twice — the components are hosts, not scoped widgets.

The overlay portal container is created by the plugin at install time, so messages work even if the
application never opens a modal.

## 5. Switching the theme at runtime

```ts
import { useTheme } from 'jin-ui'

const theme = useTheme()
theme.setStyle('brutalism')
theme.setMode('light')
```

Or bind the two switchers the Gallery uses:

```vue
<JinSelect
  :model-value="theme.style.value"
  :options="styles"
  size="sm"
  @update:model-value="(value) => theme.setStyle(value)"
/>
<JinSwitch
  :model-value="theme.mode.value === 'dark'"
  @update:model-value="(value) => theme.setMode(value ? 'dark' : 'light')"
/>
```

`useTheme()` writes the two attributes on `<html>` and calls `onChange`. It deliberately does not
persist anything itself; that is the application's job, and the Gallery shows one way to do it.

---

## Symptoms and their causes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Reactivity silently stops working; `provide`/`inject` returns nothing | Two Vue instances — the linked library loaded its own copy | Add `resolve.dedupe: ['vue']` |
| "Failed to resolve import" pointing at a file inside the library | Alias order: the bare package alias matched a sub-path import | List `jin-ui/styles`, `/themes`, `/contracts` before `jin-ui` |
| Dev server returns 403 for library files | The library is outside the app root | Add `server.fs.allow` covering the parent directory |
| Every message appears twice | The toast/notification regions are mounted more than once | Mount them once, at the root |
| A themed control looks unstyled | The theme file was not imported, so the tokens are missing | Import the theme, or accept the token fallbacks in the stylesheet |
| Styles leak into the application | The application wrote a `.jin-*` selector, or the library gained a global element selector | Run `npm run check` — both are caught mechanically |

---

## Migrating an existing stylesheet

An application with its own CSS variables does not have to rename them all at once. The library's
controls carry a fallback for every token, so the two sets can coexist while the migration happens:

1. Map the application's existing names onto the contract. The common ones have obvious
   counterparts:

   | If you have | The contract token |
   | --- | --- |
   | a page background | `--jin-bg` |
   | a panel or card surface | `--jin-surface` / `--jin-surface-raised` |
   | a primary text colour | `--jin-text` |
   | a secondary or muted text colour | `--jin-text-muted` / `--jin-text-subtle` |
   | a border colour | `--jin-border-color` |
   | an accent or brand colour | `--jin-accent` |
   | semantic colours | `--jin-danger` / `--jin-warning` / `--jin-success` / `--jin-info` |

2. Keep both sets during the transition, then delete the old names.

3. Move the application's own styles onto the contract tokens as well. That is the part that
   matters: a style switch only reaches the whole screen when everything on it reads from the
   same tokens, not just the library's own controls.
