import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import appRouter from './app.module';
import { errorHandler } from './shared/middleware/errorHandler';

const app: Express = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Central Application API Router
app.use('/api', appRouter);

// Global Error Handler Middleware
app.use(errorHandler);

export { app };
export default app;
