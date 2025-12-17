import { defineConfig, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import { IncomingMessage, ServerResponse } from 'http';
import { syncFeishuData } from './fetch_feishu.js';

// Custom plugin to handle Feishu sync API
const feishuSyncPlugin = () => ({
  name: 'feishu-sync-server',
  configureServer(server: ViteDevServer) {
    // Listen on both root path and base path to be safe
    const paths = ['/api/sync-feishu', '/anz-lottery/api/sync-feishu'];
    
    paths.forEach(path => {
      server.middlewares.use(path, async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.method === 'POST') {
          try {
            console.log(`Triggering Feishu Sync from Dev Server (${path})...`);
            await syncFeishuData();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            console.error('Sync failed:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: String(error) }));
          }
        } else {
          next();
        }
      });
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    feishuSyncPlugin(),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths()
  ],
  base: '/anz-lottery/',
})
