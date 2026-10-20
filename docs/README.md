# Lydia Documentation

This directory contains the ReStructuredText (RST) documentation for the Lydia component library.

## Structure

- `index.rst`: Main documentation index file
- `integration.md`: Integration guide for applications consuming `@msqd/lydia`
- `components/`: Documentation for Lydia components
  - `filter-components.rst`: Filter components documentation
- `development/`: Presentation boundary, component taxonomy and testing
- `testing/`: Testing infrastructure

Component and prop reference lives in Storybook, built from the source, rather than here.

## Building the Documentation

The documentation is written in ReStructuredText format, which can be built into HTML, PDF, or other formats using [Sphinx](https://www.sphinx-doc.org/).

### Prerequisites

To build the documentation, you need to have Sphinx installed:

```bash
pip install sphinx sphinx_rtd_theme
```

### Building

Once Sphinx is installed, you can build the documentation with:

```bash
cd docs
sphinx-build -b html . _build/html
```

This will generate HTML documentation in the `_build/html` directory.

## Contributing to Documentation

When adding new components or services to Lydia, please update the corresponding documentation:

1. For new components, add a new RST file in the `components/` directory
2. For new services, add a new RST file in the `services/` directory
3. Update the appropriate index files to include links to the new documentation

Follow the existing documentation style and structure for consistency.