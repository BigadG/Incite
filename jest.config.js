module.exports = {
  transform: {
      '^.+\\.(js|jsx)$': 'babel-jest',  // Transform JS and JSX files with babel-jest
    },
    moduleFileExtensions: [
      'js',
      'jsx',
      'json',
      'node',
    ],
    testMatch: [
      '**/?(*.)+(spec|test).[tj]s?(x)',
    ],
    rootDir: './',
    transformIgnorePatterns: [
      '/node_modules/', 
      '\\.pnp\\.[^\\/]+$'  // Ignore transformations for node_modules except for ESM packages
    ],
    verbose: true,
    testEnvironment: 'jsdom',
    // Setup file for React Testing Library
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  
    // Mock static file imports
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '\\.(gif|ttf|eot|svg|png|jpg)$': '<rootDir>/__mocks__/fileMock.js'
    },
  };  