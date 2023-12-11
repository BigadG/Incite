// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../extension/dist'),
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup.html')
      }
    }
  }
});
