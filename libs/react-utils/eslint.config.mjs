import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // no-empty-object-type is enabled by the @typescript-eslint preset, but pre-existing
    // code uses the FC<PropsWithChildren<{}>> idiom. Kept off to preserve the lint baseline.
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      // no-empty-function (preset default) flags a pre-existing jest console mock
      // (mockImplementation(() => {})) in applyThemeVariables.test.ts.
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // react-utils statically imports react-integration-interface in src while its spec
      // files mock/require it, so @nx/enforce-module-boundaries treats the target as
      // "lazy-loaded". The dependency is real and the static import is the intended
      // production path, so allowlist it (base options preserved) rather than force dynamic imports.
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['@onecx/react-integration-interface'],
          depConstraints: [{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }],
        },
      ],
    },
  },
]
