module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'next/core-web-vitals',
    'plugin:react/recommended',
    'airbnb',
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'no-case-declarations': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'linebreak-style': 'off',
    'react/prop-types': 'off',
    'react/no-unknown-property': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-param-reassign': 'off',
  },
};