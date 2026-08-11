import bcrypt from 'bcryptjs';
import { PrismaClient, CustomerStatus, CustomerType, MovementType, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureUser(email: string, data: { name: string; role: Role; passwordHash: string }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  try {
    return await prisma.user.create({ data: { email, ...data } });
  } catch (err) {
    if (String(err).includes('Unique constraint')) {
      return await prisma.user.findUnique({ where: { email } });
    }
    throw err;
  }
}

async function ensureCustomer(mobile: string, data: {
  name: string; email?: string | null; businessName: string; gstNumber?: string | null;
  customerType: CustomerType; address: string; status: CustomerStatus; notes?: string | null;
}) {
  const existing = await prisma.customer.findUnique({ where: { mobile } });
  if (existing) return existing;
  try {
    return await prisma.customer.create({
      data: { mobile, ...data, email: data.email ?? undefined, gstNumber: data.gstNumber ?? undefined, notes: data.notes ?? undefined }
    });
  } catch (err) {
    if (String(err).includes('Unique constraint')) {
      return await prisma.customer.findUnique({ where: { mobile } });
    }
    throw err;
  }
}

async function ensureProduct(sku: string, data: {
  name: string; category: string; unitPrice: number; currentStock?: number;
  minStockAlert?: number; location: string;
}) {
  const existing = await prisma.product.findUnique({ where: { sku } });
  if (existing) return existing;
  try {
    return await prisma.product.create({ data: { sku, ...data } });
  } catch (err) {
    if (String(err).includes('Unique constraint')) {
      return await prisma.product.findUnique({ where: { sku } });
    }
    throw err;
  }
}

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  await ensureUser('admin@fundsroom.local', { name: 'Admin User', role: Role.ADMIN, passwordHash });
  await ensureUser('sales@fundsroom.local', { name: 'Sales User', role: Role.SALES, passwordHash });
  await ensureUser('warehouse@fundsroom.local', { name: 'Warehouse User', role: Role.WAREHOUSE, passwordHash });
  await ensureUser('accounts@fundsroom.local', { name: 'Accounts User', role: Role.ACCOUNTS, passwordHash });

  const customer = await ensureCustomer('9999999999', {
    name: 'Aarav Traders',
    email: 'contact@aaravtraders.com',
    businessName: 'Aarav Traders LLP',
    gstNumber: '27ABCDE1234F1Z5',
    customerType: CustomerType.WHOLESALE,
    address: '12 Market Road, Mumbai',
    status: CustomerStatus.ACTIVE,
    notes: 'Key wholesale distributor'
  });

  const product = await ensureProduct('SKU-1001', {
    name: 'Industrial Adhesive 500ml',
    category: 'Chemicals',
    unitPrice: 249.0,
    currentStock: 120,
    minStockAlert: 20,
    location: 'Warehouse A'
  });

  const admin = await prisma.user.findUnique({ where: { email: 'admin@fundsroom.local' } });
  if (admin) {
    const stockMovementCount = await prisma.stockMovement.count();
    if (stockMovementCount === 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantityChanged: 120,
          movementType: MovementType.IN,
          reason: 'Initial stock load',
          createdById: admin.id
        }
      }).catch(() => {});
    }

    const customerNoteCount = await prisma.customerNote.count();
    if (customerNoteCount === 0) {
      await prisma.customerNote.create({
        data: {
          customerId: customer.id,
          note: 'Call back for renewal order this Friday.',
          createdById: admin.id
        }
      }).catch(() => {});
    }
  }
}

main()
  .catch((error) => {
    console.error('[seed] error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
