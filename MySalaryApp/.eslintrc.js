module.exports = {
  root: true,
  extends: ['@react-native', 'prettier', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        semi: true,
        trailingComma: 'all',
        singleQuote: true,
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        bracketSpacing: true,
        bracketSameLine: true,
        arrowParens: 'avoid',
        endOfLine: 'lf',
      },
    ],
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'computed-property-spacing': 'off',
    '@typescript-eslint/object-curly-spacing': 'off',
    'object-curly-newline': 'off',
    'object-property-newline': 'off',
  },
};
