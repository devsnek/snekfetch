'use strict';

module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'script',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  env: {
    es6: true,
    node: true,
  },
  overrides: [
    {
      files: ['*.jsx'],
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    {
      files: ['*.mjs'],
      parserOptions: { sourceType: 'module' },
      env: {
        node: true,
      },
      rules: {
        'no-restricted-globals': ['error', 'require'],
      },
    },
    {
      files: ['*.web.js'],
      env: { browser: true },
    },
  ],
  rules: {
    'strict': ['error', 'global'],
    'curly': ['error', 'multi-or-nest', 'consistent'],
    'no-iterator': 'off',
    'global-require': 'off',
    'quote-props': ['error', 'consistent-as-needed'],
    'no-param-reassign': 'off',
    'arrow-parens': ['error', 'always'],
    'no-multi-assign': 'off',
    'no-underscore-dangle': 'off',
    'no-restricted-syntax': 'off',
    'object-curly-newline': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
    }],
    'import/extensions': 'off',
  },
  globals: {
    WebAssembly: false,
    BigInt: false,
    URL: false,
  },
};
