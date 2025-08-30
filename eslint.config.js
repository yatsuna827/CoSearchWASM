import { defineConfig } from 'eslint/config'

import eslint from '@eslint/js'
import prettier from 'eslint-config-prettier'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default defineConfig(
  // TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    rules: {
      'no-var': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'off', // React Routerの自動生成ファイル対応
    },
  },
  // React
  {
    files: ['**/*.ts', '**.*.tsx'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    extends: [pluginReact.configs.flat.recommended, pluginReactHooks.configs['recommended-latest']],
    rules: {
      // React 17+では不要
      'react/react-in-jsx-scope': 'off',
      // TypeScriptを使用しているため不要
      'react/prop-types': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'build/**',
      'target/**',
      'node_modules/**',
      'app/wasm/**',
      '*.config.js',
      '*.config.ts',
      '.react-router/**',
    ],
  },
  prettier, // Prettierとの競合を避けるため最後に配置
)
