module.exports = {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react', // This line is to ensure JSX is transformed
    ],
    plugins: [
      '@babel/plugin-transform-modules-commonjs', // This plugin is necessary if you're using ESM
    ],
  };
  