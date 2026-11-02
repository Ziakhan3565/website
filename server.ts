import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { apiRouter, authMiddleware } from './server/routes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const portArgIndex = process.argv.indexOf('--port');
  const cliPort = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : null;
  const PORT = cliPort || Number(process.env.PORT) || 3000;

  app.use(express.json({
    limit: '50mb',
    verify: (req: any, _res: any, buf: Buffer) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(authMiddleware);

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Disable caching on index and dynamic assets so changes reflect immediately
  app.use((req, res, next) => {
    if (req.path === '/' || req.path.endsWith('.html') || req.path.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });

  // In development, hook up Vite dev server middlewares
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('sw.js')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zia Research institutional server running on http://0.0.0.0:${PORT}`);
    
    // Asynchronously verify Supabase connection and sync existing records
    import('./server/supabase.ts').then(async ({ testSupabaseHealth, syncAllLocalDataToSupabase, SUPABASE_PROJECT_ID }) => {
      console.log(`[Supabase] Initializing connection to project: ${SUPABASE_PROJECT_ID}`);
      const health = await testSupabaseHealth();
      console.log(`[Supabase Health]:`, health.message);
      
      const { storage } = await import('./server/storage.ts');
      const syncResult = await syncAllLocalDataToSupabase(storage);
      console.log(`[Supabase Startup Sync] Synced ${syncResult.syncedUsers} users & ${syncResult.syncedTransactions} transactions.`);

      // Automatic continuous background sync every 5 minutes (fully hands-free)
      setInterval(async () => {
        try {
          await syncAllLocalDataToSupabase(storage);
        } catch (e) {
          // silent background sync
        }
      }, 5 * 60 * 1000);
    }).catch(err => {
      console.warn(`[Supabase Startup Notice] Connection check completed with notice:`, err?.message);
    });
  });
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
