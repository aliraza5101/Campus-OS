import app from './server/app';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusOS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
