# Changelog

What changed, per version, newest first. Applications read this to know what a version brings before
they take it; the git history is the long version, this is the one that fits in a pull-request
description.

## How versions work

Semantic Versioning, in its pre-1.0 reading:

- **0.x.y** — the component API is still moving. A `y` release only fixes; an `x` release may change
  behaviour or the API, and its entry says so. Nothing an application can see changes without a line
  in here.
- **1.0.0** — when the surface documented in [docs/components.md](docs/components.md) stops moving.

A release is one commit on `main` that bumps `package.json` and adds the entry below it, tagged
`vX.Y.Z`. A consumer pinned to a `file:` or git dependency can point at the tag and read exactly
what it contains. Entries are written for the application that has to react — including behaviour
that only shows up in an unusual host layout, because that is the kind of change that costs
downstream an afternoon (see 0.1.1).

## [Unreleased]

Nothing yet. Add entries here as work lands; they move under the next version when it is cut.

## [0.3.0] — 2026-09-12

### Added

- **Six more styles**, each with a light and a dark file: `glassmorphism`, `neumorphism`,
  `flat-design`, `claymorphism`, `minimalism-and-swiss-style` and `neubrutalism`. Together with
  `brutalism` and `dimensional-layering` those are eight entries of the
  [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) catalogue
  implemented against this library's 80-token contract; [docs/theming.md](docs/theming.md) §8 lists
  them with the contract axis each one exercises, and [CREDITS.md](CREDITS.md) credits them. An
  application reacts by knowing the new values of `data-jin-style` — nothing else changes for an
  application that keeps using `jin`, and no existing style id was renamed or removed.
- **The Gallery's style switcher lists nine styles** and its token panel already reports any token a
  style leaves undefined, which is the quickest way to look at the new ones.

### Changed

- **Floating layers now take their material from the contract.** Menus, popovers, modal and drawer
  panels and toasts read `--jin-surface-translucent` and apply
  `backdrop-filter: blur(var(--jin-blur))`. Both tokens shipped in the 0.2.0 contract and neither
  was consumed anywhere, so a style could declare a blur amount and a translucent surface that
  nothing rendered — which is also why a glass style was not expressible before this release.
  - Rendering is unchanged for every style that sets the two surfaces equal and the blur to `0px`,
    and [jin.dark.css](themes/jin.dark.css) was adjusted to do exactly that: its translucent value
    now repeats the raised panel, so its overlays keep the colour they had.
  - **`dimensional-layering` is the one style whose appearance changes**: it declared a
    72%-opaque translucent surface and a 10px blur, and its overlays are now the frosted panels
    those values described.
  - A style written against 0.2.0 that leaves `--jin-surface-translucent` transparent *and* sets a
    non-zero `--jin-blur` will see its overlays become translucent on upgrade. That combination was
    inert before and is the combination this release makes work.
- `--jin-focus-ring-*` is unchanged and still declared per theme; the blur is written with its
  `-webkit-` prefix, because the stylesheet is not run through a post-processor.

## [0.2.0] — 2026-09-12

### Changed

- **The package is `@aeroscis/jin`** (was `jin-ui`). Scoped because npm already has both `jin` and
  `jin-ui`. There is still no registry release, so install from a checkout, an `npm pack` tarball or
  a git tag — [docs/consuming.md](docs/consuming.md) has all three.
- **The base stylesheet is an import the application writes**: `import '@aeroscis/jin/styles.css'`.
  It used to be pulled in by the library's entry, where a consumer's bundler could drop it silently:
  the controls still rendered, unstyled, with nothing reported anywhere. The plugin now warns once,
  by name, when the stylesheet's marker is absent.
- **An installed package resolves to `dist/`** (`main`/`module`/`types` and the default `exports`
  conditions), which `npm install` inside the library builds through `prepare`. A linked checkout
  keeps reading sources through the `source` condition — `resolve.conditions` in Vite and
  `customConditions` in the consuming `tsconfig.json` — which replaces the old alias list.

### Added

- `npm run smoke`: builds the library, packs it, extracts the tarball into a scratch project as a
  real directory, and builds that project with no aliases and no `source` condition — asserting that
  the stylesheet, the themes and the declarations arrive and type-check. Part of `prepublishOnly`.
- A mechanical check that the stylesheet declares the custom property the plugin reads
  (`tools/check_tokens.py`). The two names drifting apart is invisible in either file alone — the
  plugin just goes on reporting a missing stylesheet while it is loaded.
- `LICENSE` (MIT), and `CREDITS.md` and this file in the published tarball.

### Docs

- `docs/consuming.md` rewritten: three install paths, the two `source`-condition settings, and a
  symptom table that now includes the unstyled-controls case.
- README install and packaging sections; every `jin-ui` specifier in the docs and the Gallery
  renamed.

### Tests

- `tests/stylesheet.spec.ts`: the marker read and the warning — quiet when the sheet is loaded,
  naming the exact import when it is not, waiting for `load`, silent in test environments.

## [0.1.1] — 2026-09-12

### Fixed

- **A context menu — and every popover-family panel — landed below the fold in a host whose root
  fills the viewport.** The shared portal container sat in normal flow at the end of `<body>`, so an
  application shell that fills the viewport put it past the bottom edge, and these overlays position
  themselves in viewport coordinates inside it, which only adds up while the container starts at the
  viewport origin. The container is anchored to the viewport now, with pointer events split so the
  host underneath still receives input, and the controller writes no inline layout on it any more
  (inline styles beat the sheet, and that inline `position: relative` was what replaced the
  anchoring). Affects the context menu and everything built on the popover: dropdown, select,
  tooltip, popconfirm. Fixed-position children of the portal (scrim, modal, drawer, toast and
  notification regions) were not displaced.
- **Context menu items could not be picked with a mouse.** The dismissal module was pointed at the
  wrapper — the right-click surface — instead of the menu, so a pointerdown on an item counted as an
  outside click and hid the menu before the item's click could land.
- **A context menu opened near the bottom edge was pulled up by a whole panel**, because the edge
  clamp measured the wrapper's height instead of the menu's own box.
- **Unmounting an open overlay left it in the shared overlay stack**, and a modal or drawer also
  left the shared scrim up — which swallowed every pointer event in the host. Modal, drawer,
  popover, popconfirm and context menu now release the stack on unmount; modal and drawer lower the
  scrim with it.

### Docs

- `docs/architecture.md`: "The portal is the viewport" — the anchoring contract, the pointer-events
  split, and why jsdom cannot catch a violation. Also corrected the claim that every overlay goes
  through `usePositioning`: the context menu has no anchor element to measure and takes the
  pointer's viewport coordinates directly.
- `docs/components.md`: how to make a panel's blank area answer right-clicks (put the application's
  own class on the wrapper and size it), and what `keyboardAccessible` costs on a panel-wide wrapper.

### Tests

- 175 (was 169). New coverage: the portal contract at the source level (`tests/portal.spec.ts` —
  jsdom has no layout, so no behavioural test can catch it), the context menu opening at the
  pointer, its dismissal and its edge clamp, and unmount cleanup for modal, drawer, popover,
  popconfirm and context menu.

## [0.1.0] — 2026-09-11

Initial implementation: the components documented in [docs/components.md](docs/components.md), the
token contract and themes, the Gallery, and the overlay, positioning and focus modules the controls
are built on.
