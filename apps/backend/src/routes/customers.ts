import { Router } from 'express';
import { z } from 'zod';
import { CustomerStatus, CustomerType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { fail, success } from '../lib/http';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { serializeCustomer, serializeCustomerNote } from '../lib/serializers';

const router = Router();

const customerSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')),
  businessName: z.string().min(2),
  gstNumber: z.string().optional().or(z.literal('')),
  customerType: z.nativeEnum(CustomerType),
  address: z.string().min(5),
  status: z.nativeEnum(CustomerStatus),
  followUpDate: z.string().datetime().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal(''))
});

router.get('/', requireAuth, async (req, res) => {
  const search = String(req.query.search ?? '').trim();
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { mobile: { contains: search, mode: 'insensitive' as const } },
          { businessName: { contains: search, mode: 'insensitive' as const } }
        ]
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.customer.count({ where })
  ]);

  return success(res, {
    items: items.map(serializeCustomer),
    page,
    limit,
    total
  });
});

router.get('/:id', requireAuth, async (req, res) => {
  const customerId = String(req.params.id);
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      notesLog: { orderBy: { createdAt: 'desc' } },
      challans: {
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      }
    }
  });

  if (!customer) {
    return fail(res, 404, 'Customer not found');
  }

  const detail = customer as typeof customer & {
    notesLog: Array<{ id: string; note: string; createdAt: Date }>;
    challans: Array<Record<string, unknown>>;
  };

  return success(res, {
    customer: {
      ...serializeCustomer(customer),
      notesLog: detail.notesLog.map(serializeCustomerNote),
      challans: detail.challans
    }
  });
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'Validation failed', parsed.error.flatten());
  }

  const customer = await prisma.customer.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      gstNumber: parsed.data.gstNumber || null,
      followUpDate: parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : null,
      notes: parsed.data.notes || null
    }
  });

  return success(res, { customer: serializeCustomer(customer) }, 201);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const customerId = String(req.params.id);
  const parsed = customerSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'Validation failed', parsed.error.flatten());
  }

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      ...parsed.data,
      email: parsed.data.email === '' ? null : parsed.data.email,
      gstNumber: parsed.data.gstNumber === '' ? null : parsed.data.gstNumber,
      followUpDate: parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : undefined,
      notes: parsed.data.notes === '' ? null : parsed.data.notes
    }
  });

  return success(res, { customer: serializeCustomer(customer) });
});

router.post('/:id/notes', requireAuth, async (req: AuthRequest, res) => {
  const customerId = String(req.params.id);
  const noteSchema = z.object({ note: z.string().min(2) });
  const parsed = noteSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'Validation failed', parsed.error.flatten());
  }

  const user = req.user;
  if (!user) {
    return fail(res, 401, 'Unauthorized');
  }

  const note = await prisma.customerNote.create({
    data: {
      customerId,
      note: parsed.data.note,
      createdById: user.userId
    }
  });

  return success(res, { note: serializeCustomerNote(note) }, 201);
});

export default router;