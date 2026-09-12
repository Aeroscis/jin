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
