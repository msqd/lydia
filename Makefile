
# List of all explicitly defined targets
.PHONY: dev qa install test-storybook test-all

# Custom targets with specific logic
# ---------------------------------------------------

# Development
dev:
	pnpm dev

# Quality assurance
qa: check test-all storybook build

test-update:
	pnpm test:update

# Storybook tests
test-storybook:
	pnpm test:storybook

# Run all tests (unit tests and storybook tests)
test-all:
	pnpm test:all

# Package management
install:
	pnpm install --frozen-lockfile

# Capture all undefined targets and forward them to pnpm
.PHONY: %
%:
	pnpm $@

# Help
.PHONY: help
help:
	@echo "Available Make targets:"
	@echo "  dev          - Start the Storybook development server"
	@echo "  qa           - Run all quality assurance checks"
	@echo "  install      - Install dependencies with pnpm, from the lockfile"
	@echo "  test-storybook - Run Storybook tests"
	@echo "  test-all     - Run all tests (unit and Storybook tests)"
	@echo ""
	@echo "All other targets are forwarded directly to pnpm:"
	@echo "  make build         => pnpm build"
	@echo "  make test          => pnpm test"
	@echo "  make storybook     => pnpm storybook"
	@echo "  etc."
