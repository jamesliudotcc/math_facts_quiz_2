# Agent Rules & Architecture

## Tech Stack
- **Runtime**: Bun
- **Framework**: Expo (Universal: Web + React Native)
- **Language**: TypeScript
- **Linter/Formatter**: Biome
- **Compiler**: Use Bun's native type stripping plus TypeScript Go
- **Test Runner**: Bun's native test runner (`bun test`) for unit & integration tests, 

## Architecture: Hexagonal / Ports & Adapters
1. **Domain Layer (`/src/domain`)**: Pure logic, Math Fact entities, SR algorithms. No dependencies on UI or Storage.
2. **Infrastructure Layer (`/src/infrastructure`)**: Concrete implementations (Storage adapters, API clients).
3. **Presentation Layer (`/src/react`)**: Expo/React components for presentation.
4. **Web Layer (`src/web`)**: Alternative web presentation.
4. **Dependency Injection**: The Presentation layer injects Infrastructure into Domain.

## Development Workflow (Strict TDD)
1. **Red**: Write a test in `foo.test.ts` next to the logic file.
2. **Green**: Write the minimal code to pass the test.
3. **Refactor**: Clean up the code while maintaining test pass.
4. **Persistence**: Use interfaces for storage to allow swapping `localStorage` (web) for `SQLite` (mobile).

## Coding Standards
- No `div` or `span` in the React code. Use `View` and `Text` from `react-native`.
- Use Biome for formatting.
- LaTeX for complex math rendering only.
- For web, use semantic HTML and Pico CSS.
