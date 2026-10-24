# Lydia

Lydia is a modern React component library built with TypeScript, Vite, and TailwindCSS 4. It is designed to facilitate the creation of user interfaces for observing and interacting with HTTP APIs.

[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white)](https://msqd.github.io/lydia/)

## 🌟 Features

- **Modern UI Components**: Badges, buttons, data tables, forms, navigation bars, and more
- **TypeScript Optimized**: Strict types for better developer experience
- **Styled with TailwindCSS 4**: Leveraging the latest Tailwind features
- **Fully Tested**: Unit tests with Vitest and React Testing Library
- **Complete Documentation**: Integrated Storybook with examples for each component
- **Accessible**: Design with accessibility standards in mind

## 📚 Documentation

Explore our [Storybook](https://msqd.github.io/lydia/) to see all available components and their usage examples.

## 🚀 Installation

```bash
pnpm add @msqd/lydia
```

Lydia declares `react`, `react-dom`, `@headlessui/react` and `echarts` as peer dependencies, so your project supplies them:

```bash
pnpm add react@^19.1.0 react-dom@^19.1.0 @headlessui/react echarts
```

Everything else Lydia needs at runtime, including `tailwind-merge`, comes with the package. You do
not need to install it yourself.

## 🔧 Usage

Using Lydia in an application? Start with the [integration guide](docs/integration.md).

### Component Import

You can import components in multiple ways:

```js
// Import everything
import { Button, Badge } from "@msqd/lydia";

// Import specific component categories
import { Button, ButtonGroup } from "@msqd/lydia/Components/Buttons";

// Import individual components
import { Button } from "@msqd/lydia/Components/Buttons/Button";
```

### CSS Styles

Import the complete stylesheet in your project entry point:

```js
// Import all styles (Tailwind CSS 4 + component styles + fonts)
import '@msqd/lydia/styles'
```

Or in your CSS file:

```css
@import '@msqd/lydia/styles';
```

The styles include:
- Complete Tailwind CSS 4 base styles and utilities
- Lydia's custom theme and design tokens  
- Component-specific styling (inputs, sliders, syntax highlighting)
- Lato font family definitions

With your own Tailwind CSS 4 build, import the sources instead, so there is a single Tailwind:

```css
@import "tailwindcss";
@import "@msqd/lydia/theme.css";
@import "@msqd/lydia/components.css";
```

The [integration guide](docs/integration.md) covers fonts, theme overrides, local development against a clone and known pitfalls.

### Example

```jsx
import { Button } from "@msqd/lydia";
import { ResponseStatusBadge } from "@msqd/lydia/Elements/Http/ResponseStatusBadge";
import '@msqd/lydia/styles'; // Import styles

function App() {
  return (
    <div>
      <h1>API Status</h1>
      <ResponseStatusBadge statusCode={200} />
      <Button variant="primary">Refresh</Button>
    </div>
  );
}
```

## 💻 Development

### Prerequisites

- Node.js, at the version in [`.nvmrc`](.nvmrc)
- pnpm
- Playwright's Chromium, for the story tests (run once per machine):
  - `pnpm exec playwright install chromium`
  - `pnpm exec playwright install-deps chromium` (system libraries, needs root)

### Commands

#### Development

- **Start Storybook development server**: `make`
- **Build the library**: `make build`
- **Build Storybook static site**: `make storybook`

#### Testing and Quality Assurance

- **Run unit tests only**: `pnpm test`
- **Run story tests only** (browser): `pnpm test:storybook`
- **Run unit and story tests**: `pnpm test:all`
- **Run tests in watch mode**: `pnpm test:watch`
- **Update test snapshots**: `pnpm test:update`
- **Type checking**: `pnpm types`
- **Lint and format code**: `pnpm check`
- **Run full QA check** (types, lint, `pnpm test:all`, Storybook and library builds): `make qa`

## Security

Lydia renders captured HTTP traffic. Every transaction field it shows (URL, headers, bodies, tags, names) is untrusted: whoever sent the traffic chose it. Treat it that way in your application.

- React-rendered text is escaped by React. Lydia uses no `dangerouslySetInnerHTML`.
- The exports that return HTML are the three `ChartTooltipFormatter` methods: `formatSplitBarsTooltip`, `formatUnifiedBarsTooltip` and `formatTooltipFromData`. ECharts writes their result with `innerHTML`, so each escapes every value it interpolates. Do not concatenate your own captured data into a tooltip string without escaping it.
- No exported helper returns a URL. The only URLs Lydia renders from captured data are the `data:` image and PDF previews of the transaction detail (`ContentRenderer`). Links in `NavBar`, `Tabs` and `SummarySection` come from the props you pass.
- Headers and the copied `method + url` are shown as captured: credentials in `Authorization`, `Cookie`, `Set-Cookie` or `X-Api-Key`, or tokens in a query string, appear in clear. Masking them is your job, before you hand the data to Lydia.
- Your Content-Security-Policy must allow `img-src data:` and `frame-src data:` for the previews, and `font-src data:` if you import `@msqd/lydia/styles`, which embeds its fonts.

The [integration guide](docs/integration.md#security) has the details. Report vulnerabilities through [SECURITY.md](SECURITY.md).

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

Read [CONTRIBUTING.md](CONTRIBUTING.md) first: prerequisites, commands, commit and pull request rules. Security vulnerabilities go through [SECURITY.md](SECURITY.md).

## 📄 License

Lydia is licensed under the [Mozilla Public License 2.0](LICENSE). The Lato font it bundles is licensed under the SIL Open Font License 1.1, see [`src/fonts/OFL.txt`](src/fonts/OFL.txt). The Prism syntax theme it vendors ([`prism.css`](src/Components/Formatter/prism.css)) is MIT licensed, © 2012 Lea Verou, see the [PrismJS licence](https://github.com/PrismJS/prism/blob/master/LICENSE).
