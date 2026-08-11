import { Router } from 'express';
import { Prisma, ChallanStatus, MovementType } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { fail, success } from '../lib/http';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { serializeChallan, serializeProduct } from '../lib/serializers';

const router = Router();

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive()
});

const challanSchema = z.object({
  customerId: z.string().min(1),
  status: z.nativeEnum(ChallanStatus),
  items: z.array(itemSchema).min(1)
});

async function generateChallanNumber(tx: Prisma.TransactionClient) {
  const key = 'challan';
  const counter = await tx.counter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } }
  });

  return `CH-${String(counter.value).padStart(5, '0')}`;
}

router.get('/', requireAuth, async (req, res) => {
  const status = String(req.query.status ?? '').toUpperCase();
  const where = status && Object.values(ChallanStatus).includes(status as ChallanStatus)
    ? { status: status as ChallanStatus }
    : {};

  const challans = await prisma.challan.findMany({
    where,
    include: { customer: true, createdBy: true, items: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return success(res, { items: challans.map(serializeChallan) });
});

router.get('/:id', requireAuth, async (req, res) => {
  const challanId = String(req.params.id);
  const challan = await prisma.challan.findUnique({
    where: { id: challanId },
    include: { customer: true, createdBy: true, items: true }
  });

  if (!challan) {
    return fail(res, 404, 'Challan not found');
  }

  return success(res, { challan: serializeChallan(challan) });
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = challanSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'Validation failed', parsed.error.flatten());
  }

  if (!req.user) {
    return fail(res, 401, 'Unauthorized');
  }

  const user = req.user;

  try {
    const challan = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: parsed.data.items.map((item) => item.productId) } }
      });

      if (products.length !== parsed.data.items.length) {
        throw new Error('One or more products were not found');
      }

      const productMap = new Map(products.map((product) => [product.id, product]));

      for (const item of parsed.data.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error('One or more products were not found');
        }
        if (parsed.data.status === ChallanStatus.CONFIRMED && product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
      }

      const totalQuantity = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0);
      const challanNumber = await generateChallanNumber(tx);

      const items = parsed.data.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const unitPrice = Number(product.unitPrice);
        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          category: product.category,
          unitPrice,
          quantity: item.quantity,
          lineTotal: unitPrice * item.quantity
        };
      });

      const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId: parsed.data.customerId,
          createdById: user.userId,
          status: parsed.data.status,
          totalQuantity,
          totalAmount,
          items: { create: items }
        },
        include: { customer: true, createdBy: true, items: true }
      });

      if (parsed.data.status === ChallanStatus.CONFIRMED) {
        for (const item of parsed.data.items) {
          const product = productMap.get(item.productId)!;
          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: { decrement: item.quantity } }
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantityChanged: -item.quantity,
              movementType: MovementType.OUT,
              reason: `Confirmed challan ${challanNumber}`,
              createdById: user.userId
            }
          });
        }
      }

      return challan;
    });

    return success(res, { challan: serializeChallan(challan) }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create challan';
    return fail(res, 400, message);
  }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  const schema = z.object({ status: z.nativeEnum(ChallanStatus) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'Validation failed', parsed.error.flatten());
  }

  const challanId = String(req.params.id);

  try {
    const challan = await prisma.$transaction(async (tx) => {
      const current = await tx.challan.findUnique({
        where: { id: challanId },
        include: { items: true }
      }) as any;

      if (!current) {
        throw new Error('Challan not found');
      }

      if (current.status === parsed.data.status) {
        return current;
      }

      if (current.status !== ChallanStatus.CONFIRMED && parsed.data.status === ChallanStatus.CONFIRMED) {
        const products = await tx.product.findMany({
          where: {
            id: {
              in: current.items
                .map((item: { productId: string | null }) => item.productId)
                .filter((productId: string | null): productId is string => Boolean(productId))
            }
          }
        });
        const productMap = new Map(products.map((product) => [product.id, product]));

        for (const item of current.items) {
          const product = productMap.get(item.productId ?? '');
          if (!product) {
            throw new Error('Product not found');
          }
          if (product.currentStock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }
        }

        for (const item of current.items) {
          const product = productMap.get(item.productId ?? '')!;
          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: { decrement: item.quantity } }
          });
          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantityChanged: -item.quantity,
              movementType: MovementType.OUT,
              reason: `Confirmed challan ${current.challanNumber}`,
              createdById: current.createdById
            }
          });
        }
      }

      const updated = await tx.challan.update({
        where: { id: current.id },
        data: { status: parsed.data.status },
        include: { customer: true, createdBy: true, items: true }
      });

      return updated;
    });

    return success(res, { challan: serializeChallan(challan) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update challan';
    return fail(res, 400, message);
  }
});

export default router;