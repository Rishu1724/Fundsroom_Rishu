import { Challan, ChallanItem, Customer, Product, StockMovement, CustomerNote } from '@prisma/client';

export const toNumber = (value: unknown) => Number(value);

export function serializeCustomer(customer: Customer) {
  return {
    ...customer,
    followUpDate: customer.followUpDate?.toISOString() ?? null,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString()
  };
}

export function serializeCustomerNote(note: CustomerNote) {
  return { ...note, createdAt: note.createdAt.toISOString() };
}

export function serializeProduct(product: Product) {
  return {
    ...product,
    unitPrice: toNumber(product.unitPrice),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}

export function serializeMovement(movement: StockMovement) {
  return { ...movement, createdAt: movement.createdAt.toISOString() };
}

export function serializeChallanItem(item: ChallanItem) {
  return {
    ...item,
    unitPrice: toNumber(item.unitPrice),
    lineTotal: toNumber(item.lineTotal)
  };
}

export function serializeChallan(challan: Challan & { items?: ChallanItem[] }) {
  return {
    ...challan,
    totalAmount: toNumber(challan.totalAmount),
    createdAt: challan.createdAt.toISOString(),
    updatedAt: challan.updatedAt.toISOString(),
    items: challan.items?.map(serializeChallanItem) ?? []
  };
}