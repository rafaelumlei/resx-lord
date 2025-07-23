import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  build: {
    outDir: '../dist/media',
    emptyOutDir: true,
    minify: process.env.ENV === 'production' ? true : false,
    sourcemap: process.env.ENV === 'production' ? false : true,
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
      fileName: 'resxEditor'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
