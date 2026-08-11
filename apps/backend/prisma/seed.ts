import bcrypt from 'bcryptjs';
import { PrismaClient, CustomerStatus, CustomerType, MovementType, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const users = [
    { name: 'Admin User', email: 'admin@fundsroom.local', role: Role.ADMIN },
    { name: 'Sales User', email: 'sales@fundsroom.local', role: Role.SALES },
    { name: 'Warehouse User', email: 'warehouse@fundsroom.local', role: Role.WAREHOUSE },
    { name: 'Accounts User', email: 'accounts@fundsroom.local', role: Role.ACCOUNTS }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash }
    });
  }

  const customer = await prisma.customer.upsert({
    where: { mobile: '9999999999' },
    update: {},
    create: {
      name: 'Aarav Traders',
      mobile: '9999999999',
      email: 'contact@aaravtraders.com',
      businessName: 'Aarav Traders LLP',
      gstNumber: '27ABCDE1234F1Z5',
      customerType: CustomerType.WHOLESALE,
      address: '12 Market Road, Mumbai',
      status: CustomerStatus.ACTIVE,
      notes: 'Key wholesale distributor'
    }
  });

  const product = await prisma.product.upsert({
    where: { sku: 'SKU-1001' },
    update: {},
    create: {
      name: 'Industrial Adhesive 500ml',
      sku: 'SKU-1001',
      category: 'Chemicals',
      unitPrice: 249.0,
      currentStock: 120,
      minStockAlert: 20,
      location: 'Warehouse A'
    }
  });

  const admin = await prisma.user.findUnique({ where: { email: 'admin@fundsroom.local' } });
  if (admin) {
    await prisma.stockMovement.createMany({
      data: [
        {
          productId: product.id,
          quantityChanged: 120,
          movementType: MovementType.IN,
          reason: 'Initial stock load',
          createdById: admin.id
        }
      ],
      skipDuplicates: true
    });

    await prisma.customerNote.createMany({
      data: [
        {
          customerId: customer.id,
          note: 'Call back for renewal order this Friday.',
          createdById: admin.id
        }
      ]
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });