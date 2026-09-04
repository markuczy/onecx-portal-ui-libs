import { dirname } from 'path'
import { fileURLToPath } from 'url'
import baseConfig from '../../eslint.config.mjs'
import nx from '@nx/eslint-plugin'
import jsoncEslintParser from 'jsonc-eslint-parser'

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'ocx',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'ocx',
          style: 'kebab-case',
        },
      ],
      'no-restricted-syntax': [
        'off',
        {
          selector:
            'CallExpression[callee.object.name="console"][callee.property.name=/^(debug|info|time|timeEnd|trace)$/]',
        },
      ],
      '@angular-eslint/prefer-standalone': 'off',
    },
  },
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      // Disabled: Angular 22's change-detection schematic sets ChangeDetectionStrategy.Eager
      // (see the 2026-09-04 Angular 22 migration plan). prefer-on-push requires OnPush and
      // would force a second, out-of-scope rewrite of the schematic's applied default.
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      // Disabled: newly enabled by the @angular-eslint 22 preset during the flat-config
      // migration (was not active under @angular-eslint 21); pre-existing code does not satisfy it.
      '@angular-eslint/no-input-rename': 'off',
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      // Disabled: newly enabled by the @angular-eslint 22 template preset during the flat-config
      // migration (were not active under @angular-eslint 21); pre-existing templates don't satisfy them.
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/no-autofocus': 'off',
      '@angular-eslint/template/elements-content': 'off',
      '@angular-eslint/template/alt-text': 'off',
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['libs/angular-accelerator/**/storybook-config.ts'],
        },
      ],
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
]
