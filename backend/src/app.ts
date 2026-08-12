import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import esnafRoutes from './routes/esnaf.routes';
import qrRoutes from './routes/qr.routes';
import authRoutes from './routes/auth.routes';

const app: Express = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Ortahisar Gençkart Express + Prisma API',
    authMode: process.env.AUTH_MODE || 'MOCK',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/esnaf', esnafRoutes);
app.use('/api/qr', qrRoutes);

export default app;
