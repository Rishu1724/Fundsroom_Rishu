import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { fail, success } from '../lib/http';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { serializeMovement, serializeProduct } from '../lib/serializers';

const router = Router();

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.string().min(2),
  unitPrice: z.number().nonnegative(),
  currentStock: z.number().int().min(0),
  minStockAlert: z.number().int().min(0),
  location: z.string().min(2)
});

router.get('/', requireAuth, async (req, res) => {
  const search = String(req.query.search ?? '').trim();
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { sku: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } }
        ]
      }
    : {};

  const products = await prisma.product.findMany({ where, orderBy: { updatedAt: 'desc' } });
  return success(res, { items: products.map(serializeProduct) });
});

router.get('/movements', requireAuth, async (_req, res) => {
  const movements = await prisma.stockMovement.findMany({
    include: { product: true, createdBy: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return success(res, {
    items: movements.map((movement) => ({
      ...serializeMovement(movement as any),
      product: serializeProduct(movement.product)
    }))
  });
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'Validation failed', parsed.error.flatten());
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      unitPrice: parsed.data.unitPrice
    }
  });

  return success(res, { product: serializeProduct(product) }, 201);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const productId = String(req.params.id);
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'Validation failed', parsed.error.flatten());
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...parsed.data,
      unitPrice: parsed.data.unitPrice
    }
  });

  return success(res, { product: serializeProduct(product) });
});

export default router;