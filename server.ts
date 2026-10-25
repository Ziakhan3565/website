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
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zia Research institutional server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
