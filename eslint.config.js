import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      
      // Правила для форматирования и удаления лишних переносов строк
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }], // Макс. 1 пустая строка, не допускает пустых строк в начале/конце файла
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' }, // Пустая строка перед return
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' }, // Пустая строка после объявлений
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }, // Нет пустых строк между объявлениями переменных
      ],
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }], // Пустые строки между методами класса (кроме однострочных)
      'eol-last': ['error', 'always'], // Обязательный перенос строки в конце файла
    },
  },
);
