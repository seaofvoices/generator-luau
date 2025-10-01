import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'

export default defineConfig([
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.es6,
      },
    },
    ignores: ['coverage', 'generators', '**/templates'],
  },
])
