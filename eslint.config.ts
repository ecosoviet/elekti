import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import pluginUnicorn from 'eslint-plugin-unicorn'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/.vite/**',
      '**/.vscode/**',
      '**/node_modules/**',
      'package-lock.json',
      '**/*.json'
    ],
  },
  ...defineConfigWithVueTs(
    {
      name: 'app/files-to-lint',
      files: ['**/*.{ts,mts,tsx,vue}'],
    },

    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommended,
    ...pluginOxlint.configs['flat/recommended'],
    pluginUnicorn.configs.recommended,
    skipFormatting,
    {
      rules: {
        'vue/multi-word-component-names': 'off',
        'unicorn/filename-case': 'off',
        'unicorn/prevent-abbreviations': 'off',
      },
    },
  ),
]
