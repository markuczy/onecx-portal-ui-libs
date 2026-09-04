import baseConfig from '../../eslint.config.mjs'
import jsoncEslintParser from 'jsonc-eslint-parser'

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'],
        },
      ],
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
]
