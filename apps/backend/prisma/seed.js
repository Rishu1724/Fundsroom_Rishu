"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcryptjs_1.default.hash('Password123!', 10);
    const users = [
        { name: 'Admin User', email: 'admin@fundsroom.local', role: client_1.Role.ADMIN },
        { name: 'Sales User', email: 'sales@fundsroom.local', role: client_1.Role.SALES },
        { name: 'Warehouse User', email: 'warehouse@fundsroom.local', role: client_1.Role.WAREHOUSE },
        { name: 'Accounts User', email: 'accounts@fundsroom.local', role: client_1.Role.ACCOUNTS }
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
            customerType: client_1.CustomerType.WHOLESALE,
            address: '12 Market Road, Mumbai',
            status: client_1.CustomerStatus.ACTIVE,
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
                    movementType: client_1.MovementType.IN,
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
