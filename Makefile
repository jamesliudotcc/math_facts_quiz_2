.PHONY: help install clean chingon lint format typecheck build.web build.web.dist serve.web run test.unit test.e2e test.e2e.ui test

help: ## Show this help
	@grep -hE '^[a-z0-9._]+:.*##' $(MAKEFILE_LIST) | awk -F ':.*## ' '{printf "  %-20s %s\n", $$1, $$2}'

# Install
install: ## Install dependencies
	bun install

clean: ## Remove node_modules, dist, and build artifacts
	rm -rf node_modules dist src/web/app.js src/web/sw.js

chingon: format lint typecheck test ## Format, lint, typecheck, and test — todo bien

# Quality
lint: ## Lint and format check (Biome)
	bunx biome check .

format: ## Auto-fix lint and format issues
	bunx biome check --write .

typecheck: ## Type-check with TypeScript Go
	bunx tsgo --noEmit

# Build
build.web: ## Bundle the web app
	bun build src/web/app.ts --outfile src/web/app.js --bundle
	bun build src/web/sw.ts --outfile src/web/sw.js --bundle

build.web.dist: ## Bundle to dist/ for deployment
	bun build src/web/app.ts --outfile dist/app.js --bundle
	bun build src/web/sw.ts --outfile dist/sw.js --bundle
	cp src/web/index.html src/web/manifest.webmanifest dist/
	cp assets/icon-192.png assets/icon-512.png assets/favicon.png dist/

serve.web: build.web ## Build and serve web app locally
	bun serve-web.ts

run: serve.web ## Alias for serve.web

# Test
test.unit: ## Run unit tests only
	bun test .test.

test.e2e: ## Run Playwright e2e tests only
	bunx playwright test

test.e2e.ui: ## Run Playwright tests with interactive UI
	bunx playwright test --ui

test: test.unit test.e2e ## Run all tests (unit + e2e)
