type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
type MovementType = 'IN' | 'OUT';

type User = { id: string; name: string; email: string; role: Role };
type Customer = {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  businessName: string;
  gstNumber: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  notesLog: Array<{ id: string; note: string; createdAt: string }>;
  challans: Challan[];
};
type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdAt: string;
  updatedAt: string;
};
type ChallanItem = {
  id: string;
  productId: string | null;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};
type Challan = {
  id: string;
  challanNumber: string;
  customerId: string;
  createdById: string;
  status: ChallanStatus;
  totalQuantity: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string };
  items: ChallanItem[];
};
type StockMovement = {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdById: string;
  createdAt: string;
};
type DemoDb = {
  users: Array<User & { password: string }>;
  currentUserId: string | null;
  customers: Customer[];
  products: Product[];
  challans: Challan[];
  stockMovements: StockMovement[];
  counters: { challan: number };
};

const STORAGE_KEY = 'fundsroom_demo_db';

const demoUsers = [
  { id: 'user-admin', name: 'Admin User', email: 'admin@fundsroom.local', role: 'ADMIN' as const, password: 'Password123!' },
  { id: 'user-sales', name: 'Sales User', email: 'sales@fundsroom.local', role: 'SALES' as const, password: 'Password123!' },
  { id: 'user-warehouse', name: 'Warehouse User', email: 'warehouse@fundsroom.local', role: 'WAREHOUSE' as const, password: 'Password123!' },
  { id: 'user-accounts', name: 'Accounts User', email: 'accounts@fundsroom.local', role: 'ACCOUNTS' as const, password: 'Password123!' }
];

function now() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function seedDb(): DemoDb {
  const current = now();
  const admin = demoUsers[0];
  const customerId = 'customer-1';
  const productId = 'product-1';

  const products: Product[] = [
    {
      id: productId,
      name: 'Industrial Adhesive 500ml',
      sku: 'SKU-1001',
      category: 'Chemicals',
      unitPrice: 249,
      currentStock: 120,
      minStockAlert: 20,
      location: 'Warehouse A',
      createdAt: current,
      updatedAt: current
    },
    {
      id: 'product-2',
      name: 'Packing Tape Roll',
      sku: 'SKU-2001',
      category: 'Packaging',
      unitPrice: 38,
      currentStock: 500,
      minStockAlert: 100,
      location: 'Warehouse B',
      createdAt: current,
      updatedAt: current
    }
  ];

  const customers: Customer[] = [
    {
      id: customerId,
      name: 'Aarav Traders',
      mobile: '9999999999',
      email: 'contact@aaravtraders.com',
      businessName: 'Aarav Traders LLP',
      gstNumber: '27ABCDE1234F1Z5',
      customerType: 'WHOLESALE',
      address: '12 Market Road, Mumbai',
      status: 'ACTIVE',
      followUpDate: current,
      notes: 'Key wholesale distributor',
      createdAt: current,
      updatedAt: current,
      notesLog: [
        {
          id: 'note-1',
          note: 'Call back for renewal order this Friday.',
          createdAt: current
        }
      ],
      challans: []
    }
  ];

  const challan: Challan = {
    id: 'challan-1',
    challanNumber: 'CH-00001',
    customerId,
    createdById: admin.id,
    status: 'CONFIRMED',
    totalQuantity: 4,
    totalAmount: 996,
    createdAt: current,
    updatedAt: current,
    customer: { id: customerId, name: customers[0].name },
    items: [
      {
        id: 'item-1',
        productId,
        productName: products[0].name,
        sku: products[0].sku,
        category: products[0].category,
        unitPrice: products[0].unitPrice,
        quantity: 4,
        lineTotal: 996
      }
    ]
  };

  customers[0].challans = [challan];
  products[0].currentStock -= 4;

  return {
    users: demoUsers,
    currentUserId: null,
    customers,
    products,
    challans: [challan],
    stockMovements: [
      {
        id: 'movement-1',
        productId,
        quantityChanged: 120,
        movementType: 'IN',
        reason: 'Initial stock load',
        createdById: admin.id,
        createdAt: current
      },
      {
        id: 'movement-2',
        productId,
        quantityChanged: -4,
        movementType: 'OUT',
        reason: 'Confirmed challan CH-00001',
        createdById: admin.id,
        createdAt: current
      }
    ],
    counters: { challan: 1 }
  };
}

function loadDb(): DemoDb {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedDb();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  return JSON.parse(raw) as DemoDb;
}

function saveDb(db: DemoDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function asResponse<T>(data: T) {
  return { data } as { data: T };
}

function getCurrentUser(db: DemoDb) {
  return db.users.find((user) => user.id === db.currentUserId) ?? null;
}

function toPublicUser(user: User) {
  return { userId: user.id, role: user.role, email: user.email, name: user.name };
}

function parseBody(body?: BodyInit | null) {
  if (!body || typeof body !== 'string') {
    return {};
  }
  return JSON.parse(body) as Record<string, unknown>;
}

function matchCustomer(db: DemoDb, id: string) {
  return db.customers.find((customer) => customer.id === id) ?? null;
}

function matchProduct(db: DemoDb, id: string) {
  return db.products.find((product) => product.id === id) ?? null;
}

function withCustomerChallans(db: DemoDb, customer: Customer) {
  return {
    ...customer,
    challans: db.challans.filter((challan) => challan.customerId === customer.id)
  };
}

function summary(db: DemoDb) {
  return {
    customers: db.customers.length,
    products: db.products.length,
    challans: db.challans.length,
    lowStockProducts: db.products.filter((product) => product.currentStock <= product.minStockAlert).length
  };
}

export async function mockRequest<T>(path: string, options: RequestInit = {}) {
  const db = loadDb();
  const method = (options.method ?? 'GET').toUpperCase();
  const body = parseBody(options.body);
  const [pathname, searchString] = path.split('?');
  const searchParams = new URLSearchParams(searchString ?? '');

  if (pathname === '/auth/login' && method === 'POST') {
    const email = String(body.email ?? '');
    const password = String(body.password ?? '');
    const user = db.users.find((entry) => entry.email === email && entry.password === password);
    if (!user) throw new Error('Invalid credentials');
    db.currentUserId = user.id;
    saveDb(db);
    return asResponse({ token: `mock-${user.id}`, user: toPublicUser(user) }) as T;
  }

  if (pathname === '/auth/me' && method === 'GET') {
    const user = getCurrentUser(db);
    if (!user) throw new Error('Unauthorized');
    return asResponse({ user: toPublicUser(user) }) as T;
  }

  if (pathname === '/dashboard/summary' && method === 'GET') {
    return asResponse({ summary: summary(db) }) as T;
  }

  if (pathname === '/customers' && method === 'GET') {
    const search = (searchParams.get('search') ?? '').toLowerCase();
    const items = db.customers
      .filter((customer) => !search || [customer.name, customer.mobile, customer.businessName].some((value) => value.toLowerCase().includes(search)))
      .map((customer) => ({ ...customer, challans: undefined }));
    return asResponse({ items }) as T;
  }

  if (pathname.startsWith('/customers/') && pathname.endsWith('/notes') && method === 'POST') {
    const id = pathname.split('/')[2];
    const customer = matchCustomer(db, id);
    if (!customer) throw new Error('Customer not found');
    const note = { id: uid('note'), note: String(body.note ?? ''), createdAt: now() };
    customer.notesLog.unshift(note);
    customer.updatedAt = now();
    saveDb(db);
    return asResponse({ note }) as T;
  }

  if (pathname.startsWith('/customers/') && method === 'GET') {
    const id = pathname.split('/')[2];
    const customer = matchCustomer(db, id);
    if (!customer) throw new Error('Customer not found');
    return asResponse({ customer: withCustomerChallans(db, customer) }) as T;
  }

  if (pathname === '/customers' && method === 'POST') {
    const current = now();
    const customer: Customer = {
      id: uid('customer'),
      name: String(body.name ?? ''),
      mobile: String(body.mobile ?? ''),
      email: body.email ? String(body.email) : null,
      businessName: String(body.businessName ?? ''),
      gstNumber: body.gstNumber ? String(body.gstNumber) : null,
      customerType: String(body.customerType ?? 'WHOLESALE') as CustomerType,
      address: String(body.address ?? ''),
      status: String(body.status ?? 'LEAD') as CustomerStatus,
      followUpDate: body.followUpDate ? String(body.followUpDate) : null,
      notes: body.notes ? String(body.notes) : null,
      createdAt: current,
      updatedAt: current,
      notesLog: [],
      challans: []
    };
    db.customers.unshift(customer);
    saveDb(db);
    return asResponse({ customer }) as T;
  }

  if (pathname === '/products' && method === 'GET') {
    return asResponse({ items: db.products }) as T;
  }

  if (pathname === '/products' && method === 'POST') {
    const current = now();
    const product: Product = {
      id: uid('product'),
      name: String(body.name ?? ''),
      sku: String(body.sku ?? ''),
      category: String(body.category ?? ''),
      unitPrice: Number(body.unitPrice ?? 0),
      currentStock: Number(body.currentStock ?? 0),
      minStockAlert: Number(body.minStockAlert ?? 0),
      location: String(body.location ?? ''),
      createdAt: current,
      updatedAt: current
    };
    db.products.unshift(product);
    saveDb(db);
    return asResponse({ product }) as T;
  }

  if (pathname.startsWith('/products/') && method === 'PATCH') {
    const id = pathname.split('/')[2];
    const product = matchProduct(db, id);
    if (!product) throw new Error('Product not found');
    Object.assign(product, {
      name: body.name ? String(body.name) : product.name,
      sku: body.sku ? String(body.sku) : product.sku,
      category: body.category ? String(body.category) : product.category,
      unitPrice: body.unitPrice !== undefined ? Number(body.unitPrice) : product.unitPrice,
      currentStock: body.currentStock !== undefined ? Number(body.currentStock) : product.currentStock,
      minStockAlert: body.minStockAlert !== undefined ? Number(body.minStockAlert) : product.minStockAlert,
      location: body.location ? String(body.location) : product.location,
      updatedAt: now()
    });
    saveDb(db);
    return asResponse({ product }) as T;
  }

  if (pathname === '/challans' && method === 'GET') {
    return asResponse({ items: db.challans.map((challan) => ({ ...challan, customer: db.customers.find((customer) => customer.id === challan.customerId)?.id ? { id: challan.customerId, name: db.customers.find((customer) => customer.id === challan.customerId)?.name ?? '' } : undefined })) }) as T;
  }

  if (pathname === '/challans' && method === 'POST') {
    const currentUser = getCurrentUser(db);
    if (!currentUser) throw new Error('Unauthorized');
    const customer = matchCustomer(db, String(body.customerId ?? ''));
    if (!customer) throw new Error('Customer not found');

    const requestItems = Array.isArray(body.items) ? body.items as Array<{ productId: string; quantity: number }> : [];
    if (requestItems.length === 0) throw new Error('At least one product is required');

    const products = requestItems.map((item) => {
      const product = matchProduct(db, item.productId);
      if (!product) throw new Error('Product not found');
      return { product, quantity: Number(item.quantity) };
    });

    if (String(body.status ?? 'DRAFT') === 'CONFIRMED') {
      for (const { product, quantity } of products) {
        if (product.currentStock < quantity) throw new Error(`Insufficient stock for ${product.name}`);
      }
    }

    const challanNumber = `CH-${String((db.counters.challan += 1)).padStart(5, '0')}`;
    const items: ChallanItem[] = products.map(({ product, quantity }) => ({
      id: uid('item'),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: product.unitPrice,
      quantity,
      lineTotal: product.unitPrice * quantity
    }));
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const current = now();
    const challan: Challan = {
      id: uid('challan'),
      challanNumber,
      customerId: customer.id,
      createdById: currentUser.id,
      status: String(body.status ?? 'DRAFT') as ChallanStatus,
      totalQuantity,
      totalAmount,
      createdAt: current,
      updatedAt: current,
      customer: { id: customer.id, name: customer.name },
      items
    };

    if (challan.status === 'CONFIRMED') {
      for (const item of items) {
        const product = matchProduct(db, item.productId ?? '');
        if (!product) continue;
        product.currentStock -= item.quantity;
        db.stockMovements.unshift({
          id: uid('movement'),
          productId: product.id,
          quantityChanged: -item.quantity,
          movementType: 'OUT',
          reason: `Confirmed challan ${challanNumber}`,
          createdById: currentUser.id,
          createdAt: current
        });
      }
    }

    db.challans.unshift(challan);
    customer.challans = db.challans.filter((entry) => entry.customerId === customer.id);
    saveDb(db);
    return asResponse({ challan }) as T;
  }

  if (pathname.startsWith('/challans/') && method === 'GET') {
    const id = pathname.split('/')[2];
    const challan = db.challans.find((entry) => entry.id === id);
    if (!challan) throw new Error('Challan not found');
    return asResponse({ challan }) as T;
  }

  if (pathname.startsWith('/challans/') && pathname.endsWith('/status') && method === 'PATCH') {
    const id = pathname.split('/')[2];
    const challan = db.challans.find((entry) => entry.id === id);
    if (!challan) throw new Error('Challan not found');
    const nextStatus = String(body.status ?? 'DRAFT') as ChallanStatus;
    if (challan.status !== 'CONFIRMED' && nextStatus === 'CONFIRMED') {
      for (const item of challan.items) {
        const product = matchProduct(db, item.productId ?? '');
        if (!product) throw new Error('Product not found');
        if (product.currentStock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      }
      for (const item of challan.items) {
        const product = matchProduct(db, item.productId ?? '');
        if (!product) continue;
        product.currentStock -= item.quantity;
        db.stockMovements.unshift({
          id: uid('movement'),
          productId: product.id,
          quantityChanged: -item.quantity,
          movementType: 'OUT',
          reason: `Confirmed challan ${challan.challanNumber}`,
          createdById: challan.createdById,
          createdAt: now()
        });
      }
    }
    challan.status = nextStatus;
    challan.updatedAt = now();
    saveDb(db);
    return asResponse({ challan }) as T;
  }

  throw new Error(`Mock endpoint not implemented: ${method} ${pathname}`);
}
