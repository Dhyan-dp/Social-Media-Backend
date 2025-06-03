// eslint.config.cjs
const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const nodePlugin = require('eslint-plugin-node');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        Buffer: 'readonly',
      },
    },
    plugins: {
      node: nodePlugin,
    },
    rules: {
      'no-console': 'off', // Allow console.log
      'node/no-unsupported-features/es-syntax': 'off', // if you're using ES modules
    },
  },
  {
    ignores: ['node_modules', 'prisma', 'dist'],
  },
  prettier,
];
