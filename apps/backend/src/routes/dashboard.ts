import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { success } from '../lib/http';

const router = Router();

router.get('/summary', requireAuth, async (_req, res) => {
  const [customers, products, challans, lowStockProducts] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.challan.count(),
    prisma.product.findMany()
  ]);

  return success(res, {
    summary: {
      customers,
      products,
      challans,
      lowStockProducts: lowStockProducts.filter((product) => product.currentStock <= product.minStockAlert).length
    }
  });
});

export default router;