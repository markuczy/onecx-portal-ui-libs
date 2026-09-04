import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // no-empty-object-type is enabled by the @typescript-eslint preset, but pre-existing
    // React code uses the FC<PropsWithChildren<{}>> idiom. Kept off to preserve the
    // established lint baseline during the Angular 22 / flat-config migration.
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
]
