module.exports = {
    transform: {
      '^.+\\.jsx?$': 'babel-jest', // This line tells Jest to use babel-jest for .js and .jsx files
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
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest',  // Transform JS and JSX files with babel-jest
    },
    transformIgnorePatterns: [
      '/node_modules/', 
      '\\.pnp\\.[^\\/]+$'  // Ignore transformations for node_modules except for ESM packages
    ],
    verbose: true,
  
    // Setup file for React Testing Library
    setupFilesAfterEnv: ['./jest.setup.js'],
  
    // Mock static file imports
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '\\.(gif|ttf|eot|svg|png|jpg)$': '<rootDir>/__mocks__/fileMock.js'
    },
  };  