import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Gate only the pure, unit-testable library code at 100%. The rendered
      // site (templates, config, network scripts) is covered by the functional
      // (Playwright) and accessibility (pa11y / Lighthouse) suites instead.
      include: ['lib/**/*.js'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
