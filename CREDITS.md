# Credits and attribution

## Reference styles: nextlevelbuilder/ui-ux-pro-max-skill

The non-Jin themes in this library are implementations of style definitions from
[**nextlevelbuilder/ui-ux-pro-max-skill**](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill),
an AI design-intelligence skill that catalogues searchable UI styles alongside colour palettes,
font pairings and UX guidelines.

- **Repository:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **Author:** Next Level Builder
- **License:** MIT — Copyright (c) 2024 Next Level Builder
- **What we took:** the *style definitions* — the visual characteristics that make a named style
  recognisable. The catalogue is where the token contract's requirement to cover shape, depth,
  texture and motion — not just colour — came from. Two entries are implemented as themes so far:

  | Style | The characteristics we implemented |
  | --- | --- |
  | **Brutalism** | Zero radius, no shadow, no motion, thick visible borders, flat colour |
  | **Dimensional Layering** | Soft depth through four elevation levels, generous radii, layered surfaces |

- **What is ours:** the token values, the CSS, and the translation of each style onto this library's
  80-token contract. No stylesheet or asset from that repository is copied in.

### Why the styles are implemented rather than imported

That catalogue is a *skill*: it describes styles as guidance for a design or coding agent. It ships
no CSS that could be dropped in, and its styles are not written against this library's token
contract. So each style here is an independent implementation of the described characteristics,
which is also what makes them comparable side by side in the Gallery.

### Adding more styles

The catalogue is much larger than two entries. Any further style added to `themes/` should be
credited here in the same table, and should keep the same obligations: define all 80 contract
tokens, pass `tools/check_tokens.py` and `tools/check_contrast.py`, and make no reference to an
application.

## Jin (锦)

The Jin theme — the library's own visual identity and default — is original work, not drawn from
that catalogue. Its specification is in [docs/theming.md](docs/theming.md).

## Dependencies

Runtime and build dependencies are credited through their own packages; the library ships none of
their code. The single peer dependency is Vue 3, consumed as an external.
