import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression for all assets
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,       // only compress files > 1KB
    }),
    // Brotli compression (even better ratio)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Minify with terser for better obfuscation
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        toplevel: true,
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    // Disable source maps in production so source code isn't accessible
    sourcemap: false,
    rollupOptions: {
      output: {
        // Hash-based filenames make code harder to trace
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash][extname]',
        manualChunks(id) {
          // Core React — loaded on every page
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-core';
          }
          // Router
          if (id.includes('react-router')) {
            return 'router';
          }
          // Charts — only used on dashboard
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }
          // Animation + UI libs
          if (id.includes('framer-motion')) {
            return 'animation';
          }
          // Form handling
          if (id.includes('react-hook-form') || id.includes('react-dropzone')) {
            return 'forms';
          }
          // Toast / misc small libs
          if (id.includes('react-hot-toast') || id.includes('lucide-react')) {
            return 'ui-lib';
          }
        },
      },
    },
  },
});
