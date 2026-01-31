/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Student Center App',
          short_name: 'StudentCenter',
          description: 'Your campus connection for stories and updates.',
          theme_color: '#10b981',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          // Exclude large chunks from precaching
          globIgnores: [
            '**/node_modules/**/*',
            'sw.js',
            'workbox-*.js',
            'assets/stc-apps-*.js',
            'assets/games-*.js',
            'assets/realtime-*.js',
            'assets/leaderboard-*.js',
          ],
          manifestTransforms: [
            async (manifest) => {
              const manifestItems = manifest.filter(entry => {
                return !/assets\/(stc-apps|games|realtime|leaderboard)-[a-zA-Z0-9]+\.js/.test(entry.url);
              });
              return { manifest: manifestItems };
            }
          ]
        }
      })
    ],
    build: {
      chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('src/pages/stc-apps')) {
              return 'stc-apps';
            }
            if (id.includes('src/pages/games')) {
              return 'games';
            }
            if (id.includes('src/pages/realtime')) {
              return 'realtime';
            }
            if (id.includes('src/pages/leaderboard')) {
              return 'leaderboard';
            }
          }
        }
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@marketplace': path.resolve(__dirname, 'src/features/marketplace'),
      }
    }
  };
});
