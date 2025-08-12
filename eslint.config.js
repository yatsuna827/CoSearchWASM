import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  {
    files: ['app/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
      react: react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        globalThis: 'readonly',
        // ブラウザAPI
        fetch: 'readonly',
        URL: 'readonly',
        Response: 'readonly',
        WebAssembly: 'readonly',
        TextDecoder: 'readonly',
        HTMLInputElement: 'readonly',
        // Service Worker
        self: 'readonly',
        ServiceWorkerGlobalScope: 'readonly',
        // React
        React: 'readonly',
      },
    },
    rules: {
      // TypeScript recommended rules
      ...typescript.configs.recommended.rules,

      // React recommended rules
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // カスタムルール
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react/react-in-jsx-scope': 'off', // React 17+では不要
      'react/prop-types': 'off', // TypeScriptを使用しているため

      // BiomeJSから移行時の調整
      'no-unused-vars': 'off', // @typescript-eslint/no-unused-vars を使用
      'prefer-const': 'warn', // BiomeJSの noParameterAssign 相当
      'no-redeclare': 'off', // TypeScriptで型とvalueの重複定義を許可
      '@typescript-eslint/no-empty-object-type': 'off', // React Routerの自動生成ファイル対応
      'no-undef': 'off', // TypeScript環境では不要
    },
    settings: {
      react: {
        version: 'detect',
      },
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
      'public/sw.js',
    ],
  },
  prettier, // Prettierとの競合を避けるため最後に配置
]
