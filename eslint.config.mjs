import globals from 'globals'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import boundaries from 'eslint-plugin-boundaries'

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.{ts,vue}'],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/root-path': process.cwd(),
      'import/resolver': {
        typescript: {
          project: './tsconfig.app.json',
        },
      },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'pages', pattern: 'src/pages/*' },
        { type: 'widgets', pattern: 'src/widgets/*' },
        { type: 'features', pattern: 'src/features/*' },
        { type: 'entities', pattern: 'src/entities/*' },
        { type: 'shared', pattern: 'src/shared' },
      ],
      'boundaries/files': [
        {
          category: 'slice-internal',
          pattern: 'src/{pages,widgets,features,entities}/*/{api,model,ui}/**/*',
        },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              allow: { to: { element: { type: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] } } },
            },
            { from: { element: { type: 'pages' } }, allow: { to: { element: { type: ['widgets', 'features', 'entities', 'shared'] } } } },
            { from: { element: { type: 'widgets' } }, allow: { to: { element: { type: ['features', 'entities', 'shared'] } } } },
            { from: { element: { type: 'features' } }, allow: { to: { element: { type: ['entities', 'shared'] } } } },
            { from: { element: { type: 'entities' } }, allow: { to: { element: { type: 'shared' } } } },
            { from: { element: { type: 'shared' } }, allow: { to: { element: { type: 'shared' } } } },
            {
              disallow: { to: { file: { categories: 'slice-internal' } } },
              message: 'Import slices through their public index.ts entry point.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      vue,
    },
    rules: {
      ...vue.configs.recommended.rules,
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
]
