import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import config from './config';

const app: Express = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes will be added here
app.get('/api', (_req: Request, res: Response) => {
  res.json({ message: 'Codenames API Server' });
});

export default app;
