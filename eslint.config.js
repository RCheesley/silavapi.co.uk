import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      '_site/**',
      'node_modules/**',
      'coverage/**',
      '.lighthouseci/**',
      'playwright-report/**',
      'test-results/**',
      'design-handoff/**',
      'src/assets/fonts/**',
    ],
  },
  js.configs.recommended,
  {
    // Default environment: Node (build scripts, Eleventy config, lib, unit tests).
    // Node 24 provides fetch/URL/etc. Browser-only globals are intentionally NOT
    // enabled here, so accidental use of window/document in Node code is caught.
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      // Allow unused catch bindings so ES5-safe `catch (e)` passes lint.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-console': 'off',
    },
  },
  {
    // Client-side progressive-enhancement scripts run in the browser only.
    files: ['src/assets/js/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    // Playwright specs run in Node but evaluate callbacks in the browser
    // (document/window/location inside page.evaluate), so both are valid.
    files: ['tests/e2e/**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
];
