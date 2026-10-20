# Lato Font Files

Self-hosted Lato, used by the Lydia component library.

## Font Files

| File | Face | Weight | Style |
| --- | --- | --- | --- |
| `Lato-Regular.woff2` | Lato Regular | 400 | upright |
| `Lato-Bold.woff2` | Lato Bold | 700 | upright |
| `Lato-Italic.woff2` | Lato Italic | 400 | italic |
| `Lato-BoldItalic.woff2` | Lato Bold Italic | 700 | italic |

`src/fonts.test.ts` reads each file and asserts it is the face its name claims. That check exists
because these files were previously wrong in a way no size or existence check could catch: every one
of the four was an italic face, `Lato-Bold.woff2` was a byte-identical copy of Lato Italic, and two
were 43-glyph subsets. Please keep the test passing rather than deleting it.

## Provenance

- **Source**: Google Fonts, `https://fonts.googleapis.com/css2?family=Lato`, which serves the files
  from `fonts.gstatic.com`.
- **Version**: `v25`, the version Google Fonts served on 15 August 2026.
- **Subset**: `latin` (U+0000–00FF plus common punctuation, currency and symbols), 224 glyphs per
  face. The `latin-ext` subset is **not** bundled; text outside that range falls back through the
  stack below.
- **Upstream project**: <https://github.com/latofonts/lato-source>, by Łukasz Dziedzic.

## License

Lato is licensed under the SIL Open Font License, Version 1.1. The full licence text ships beside
the fonts as [`OFL.txt`](./OFL.txt), which is a condition of redistributing them.

## Font Stack

Configured in `src/theme.css` as `--font-sans`, the namespace Tailwind 4 reads:

```css
--font-sans:
  Lato, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
  "Segoe UI Symbol", "Noto Color Emoji";
```

The name matters. A token declared as `--font-family-sans` is not read by Tailwind, and every
`font-sans` utility silently resolves to Tailwind's own default instead, which contains no Lato.

## Usage

Lato applies wherever the `font-sans` family applies, which under Tailwind's preflight is the whole
document. A consumer importing `@msqd/lydia/styles` gets both the `@font-face` declarations and the token,
so no further configuration is needed.

The `@font-face` rules reference `/fonts/*.woff2`, so these files must be served from the site root,
including with `@msqd/lydia/styles`. They ship as `dist/fonts` in the package: copy or serve that folder at `/fonts/`.

## Loading

- `font-display: swap`, so text stays readable in a fallback face while Lato loads.
- `Lato-Regular.woff2` and `Lato-Bold.woff2` are preloaded in `index.html`.
- WOFF2 only, which every browser supporting CSS custom properties also supports.

## Fallback

If Lato fails to load, or a character falls outside the bundled subset, the browser continues
through the stack: `ui-sans-serif`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`,
`Roboto`, `Helvetica Neue`, `Arial`, `Noto Sans`, `sans-serif`, then the emoji faces.
