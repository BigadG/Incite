module.exports = {
  "root": true,
  "env": {
    "browser": true,
    "es2021": true,
    "jest/globals": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jest/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended"
  ],
  "ignorePatterns": ["dist", ".eslintrc.cjs"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "plugins": [
    "react-refresh",
    "jest",
    "react"
  ],
  "rules": {
    "react-refresh/only-export-components": ["warn", { "allowConstantExport": true }],
    "react/react-in-jsx-scope": "off",
    "react/jsx-no-target-blank": "warn",
    "no-unused-vars": "warn",
    "no-undef": "warn"
    // Add any specific client-side rules or override defaults here
  }
};

