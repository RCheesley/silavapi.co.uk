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
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  {
    // Front-end progressive-enhancement scripts run in the browser only.
    files: ['src/assets/js/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
