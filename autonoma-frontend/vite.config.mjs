import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';
import path from 'path';

export default defineConfig(({ mode }) => {
  // depending on your application, base can also be "/"
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = env.VITE_APP_BASE_NAME || '/';
  const PORT = 3000;

  return {
    server: {
      port: 3000,
      strictPort: false,
      host: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost'
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1000,
      sourcemap: true,
      // Vite-specific optimizations
      cssCodeSplit: true,
      // esbuild options for production
      ...(mode === 'production' && {
        esbuild: {
          drop: ['console', 'debugger'],
          pure: ['console.log', 'console.info', 'console.debug', 'console.warn']
        }
      })
    },
    preview: {
      open: true,
      host: true
    },
    define: {
      global: 'window'
    },
    resolve: {
      alias: {
        App: path.resolve(__dirname, 'src/App'),
        store: path.resolve(__dirname, 'src/store'),
        serviceWorker: path.resolve(__dirname, 'src/serviceWorker'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        assets: path.resolve(__dirname, 'src/assets'),
        'ui-component': path.resolve(__dirname, 'src/ui-component'),
        'hooks': path.resolve(__dirname, 'src/hooks'),
        'views': path.resolve(__dirname, 'src/views'),
        'layout': path.resolve(__dirname, 'src/layout'),
        'utils': path.resolve(__dirname, 'src/utils'),
        'contexts': path.resolve(__dirname, 'src/contexts'),
        'menu-items': path.resolve(__dirname, 'src/menu-items'),
        'themes': path.resolve(__dirname, 'src/themes'),
        'config': path.resolve(__dirname, 'src/config'),
        'routes': path.resolve(__dirname, 'src/routes'),
        'metrics': path.resolve(__dirname, 'src/metrics'),
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs'
      }
    },
    base: API_URL,
    plugins: [react(), jsconfigPaths()],
    optimizeDeps: {
      include: ['@mui/material/Tooltip', 'react', 'react-dom', 'react-router-dom']
    }
  };
});
