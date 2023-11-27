module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2021: true,
    'jest/globals': true, 
    node: true, // Add node environment for backend code
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended', // Use recommended jest linting
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true, // Enable linting for JSX
    },
  },
  settings: { 
    react: { 
      version: 'detect',
    },
  },
  plugins: [
    'react-refresh', 
    'jest',
    'react', // Add react plugin
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/react-in-jsx-scope': 'off', // Disable since React 17+ doesn't require React in scope
    'react/jsx-no-target-blank': 'warn', // Warn about security risk of target="_blank" without rel="noreferrer"
    'no-unused-vars': 'warn', // Change to warning to reduce noise from unused variables
    'no-undef': 'warn', // Change to warning for undefined variables
  },
}
