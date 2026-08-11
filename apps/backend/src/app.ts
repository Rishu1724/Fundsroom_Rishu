import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import productRoutes from './routes/products';
import challanRoutes from './routes/challans';
import dashboardRoutes from './routes/dashboard';

export function createApp() {
  const app = express();

  const configuredOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const isAllowedOrigin = (origin: string | undefined) => {
    if (!origin) {
      return true;
    }

    if (configuredOrigins.includes('*') || configuredOrigins.includes(origin)) {
      return true;
    }

    return (
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin) ||
      /^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin) ||
      /^https:\/\/.*\.onrender\.com$/i.test(origin)
    );
  };

  app.use(
    cors({
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('Not allowed by CORS'));
      },
      credentials: false
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