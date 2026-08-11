import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import productRoutes from './routes/products';
import challanRoutes from './routes/challans';
import dashboardRoutes from './routes/dashboard';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',').map((item) => item.trim()) ?? '*',
      credentials: true
    })
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/auth', authRoutes);
  app.use('/customers', customerRoutes);
  app.use('/products', productRoutes);
  app.use('/challans', challanRoutes);
  app.use('/dashboard', dashboardRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: { message: 'Route not found' } });
  });

  return app;
}