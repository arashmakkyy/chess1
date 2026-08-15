import express from 'express';
import { leagueRouter } from './routes/leagueRoutes';
import { commentaryRouter } from './routes/commentaryRoutes';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Basic CORS headers to allow smooth local/preview development and Vercel hosting
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Mount API modules
  app.use('/api/league', leagueRouter);
  app.use('/api/commentary', commentaryRouter);

  return app;
}
