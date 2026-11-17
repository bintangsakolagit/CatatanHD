import nextPlugin from '@next/eslint-plugin-next'
import tseslint from 'typescript-eslint'

/**
 * Konfigurasi ESLint flat.
 * Next.js 16 tidak lagi menjalankan lint saat build, jadi lint dijalankan terpisah.
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.netlify/**',
      '**/next-env.d.ts',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Proyek ini hanya memakai App Router, jadi tidak ada folder pages/.
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
)
