import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Specify the output directory as 'dist'
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // Your main entry file
        popup: resolve(__dirname, 'public', 'popup.html'), // Path to your popup.html
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      }
    }
  }
});

