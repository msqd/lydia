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

Lydia declares `react` and `react-dom` as peer dependencies, so your project supplies them:

```bash
pnpm add react@^19.1.0 react-dom@^19.1.0
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
@source "../node_modules/@msqd/lydia/dist";
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

- Node.js (latest LTS version recommended)
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

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

### Contribution Guidelines

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

A PR that changes `src/` adds a changelog fragment; see [RELEASING.md](RELEASING.md), which also covers cutting a release.

## 📄 License

Lydia is licensed under the [Mozilla Public License 2.0](LICENSE). The Lato font it bundles is licensed under the SIL Open Font License 1.1, see [`public/fonts/OFL.txt`](public/fonts/OFL.txt). The Prism syntax theme it vendors ([`prism.css`](src/Components/Formatter/prism.css)) is MIT licensed, © 2012 Lea Verou, see the [PrismJS licence](https://github.com/PrismJS/prism/blob/master/LICENSE).
