# Storybook Test Runner with Vitest Integration

This directory contains documentation for the testing infrastructure in Lydia, which integrates:

- Vitest for unit testing
- Storybook Test Runner for component testing
- Integration between the two systems

To learn more, see the [index.rst](./index.rst) file or view the documentation site.

## Quick Start

To run tests:

```bash
# Run unit tests
make test

# Run Storybook tests
make test-storybook

# Run all tests
make test-all
```

## Testing Components

Component tests can be added directly in story files using the `play` function:

```tsx
export const WithInteractionTest: Story = {
  args: {
    // story args
  },
  play: async ({ canvasElement, args }) => {
    // test code here
  }
};
```
