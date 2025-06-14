/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
module.exports = {
  mutate: [
    'src/domain/**/*.ts',
    '!src/**/dtos/**/*.ts',
    '!src/**/types/**/*.ts',
    '!src/**/entities/**/*.ts',
    '!src/**/events/**/*.ts',
    '!src/core/types/**/*.ts',
    '!src/core/entities/**/*.ts',
    '!src/**/__tests__/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
  ],
  testRunner: 'vitest',
  coverageAnalysis: 'off',
  reporters: ['clear-text', 'progress', 'html'],
  tsconfigFile: 'tsconfig.stryker.json',
  checkers: ['typescript'],
  vitest: {
    configFile: 'vitest.config.stryker.mjs',
  },
  mutator: {
    excludedMutations: ['BooleanSubstitution', 'StringLiteral'],
  },
  // ignoreStatic: true,
  ignoreMethods: ['toValue', 'toString'],
  timeoutMS: 60000,
}
