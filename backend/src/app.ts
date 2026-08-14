import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import discountRoutes from './routes/discount.routes';
import esnafRoutes from './routes/esnaf.routes';
import qrRoutes from './routes/qr.routes';
import adminRoutes from './routes/admin.routes';
import merchantRoutes from './routes/merchant.routes';
import studentRoutes from './routes/student.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Rotaları
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/discount', discountRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/merchant', merchantRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/esnaf', esnafRoutes);
app.use('/api/qr', qrRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', authMode: process.env.AUTH_MODE || 'MOCK' });
});

export default app;
