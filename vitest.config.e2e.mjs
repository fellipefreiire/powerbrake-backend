import swc from 'unplugin-swc'
import { defineConfig, configDefaults } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    exclude: [
      ...configDefaults.exclude,
      '**/data/pg/**',
      '**/.stryker-tmp/**',
      'vitest.config.stryker.ts',
    ],
    setupFiles: ['./test/setup-e2e.ts'],
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
