The package is renamed `@msqd/lydia`, published on npm. Every `lydia/...` import becomes `@msqd/lydia/...`, and `lydia/styles` becomes `@msqd/lydia/styles`. The package ships `dist` only, no `src`.

  Consumers that read Lydia's sources must switch:

  - `src/main.css` and the component CSS (`Input.css`, `RangeSliderStyles.css`, `prism.css`) become `@msqd/lydia/theme.css` and `@msqd/lydia/components.css`.
  - Tailwind `@source` points at the package `dist`.
  - Fonts move from `public/fonts` to `dist/fonts`.
