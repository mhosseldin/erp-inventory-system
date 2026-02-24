import 'dotenv/config';

import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  OrderType,
  OrderStatus,
  MovementType,
  InvoiceStatus,
} from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // ─── ROLES ───────────────────────────────────────────────────────────────

  const roleData = [
    { name: 'ADMIN', description: 'Full access to all modules' },
    { name: 'ACCOUNTANT', description: 'Financial reports and invoices' },
    { name: 'SALES', description: 'Create and manage sale orders' },
    { name: 'STOREKEEPER', description: 'Inventory and purchase orders' },
  ];

  for (const role of roleData) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  const roles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));
  console.log('✅ Roles seeded');

  // ─── WAREHOUSE ───────────────────────────────────────────────────────────

  await prisma.warehouse.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Main Warehouse',
      location: 'Cairo, Egypt',
      is_default: true,
    },
  });

  const warehouse = await prisma.warehouse.findFirstOrThrow({
    where: { is_default: true },
  });
  console.log('✅ Warehouse seeded');

  // ─── USERS ───────────────────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash('Password@123', 10);

  const usersData = [
    {
      email: 'admin@stockflow.com',
      fullname: 'Karim Hassan',
      role_id: roleMap['ADMIN'],
    },
    {
      email: 'admin2@stockflow.com',
      fullname: 'Nadia Mostafa',
      role_id: roleMap['ADMIN'],
    },
    {
      email: 'accountant@stockflow.com',
      fullname: 'Youssef Ibrahim',
      role_id: roleMap['ACCOUNTANT'],
    },
    {
      email: 'accountant2@stockflow.com',
      fullname: 'Salma Adel',
      role_id: roleMap['ACCOUNTANT'],
    },
    {
      email: 'sales1@stockflow.com',
      fullname: 'Ahmed Tarek',
      role_id: roleMap['SALES'],
    },
    {
      email: 'sales2@stockflow.com',
      fullname: 'Mariam Samir',
      role_id: roleMap['SALES'],
    },
    {
      email: 'sales3@stockflow.com',
      fullname: 'Omar Fathy',
      role_id: roleMap['SALES'],
    },
    {
      email: 'store1@stockflow.com',
      fullname: 'Hassan Mahmoud',
      role_id: roleMap['STOREKEEPER'],
    },
    {
      email: 'store2@stockflow.com',
      fullname: 'Dina Khaled',
      role_id: roleMap['STOREKEEPER'],
    },
    {
      email: 'store3@stockflow.com',
      fullname: 'Tamer Nabil',
      role_id: roleMap['STOREKEEPER'],
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password_hash: passwordHash, is_active: true },
    });
  }

  const users = await prisma.user.findMany({ include: { role: true } });
  const adminUser = users.find((u) => u.role.name === 'ADMIN')!;
  const salesUsers = users.filter((u) => u.role.name === 'SALES');
  const storekeeperUsers = users.filter((u) => u.role.name === 'STOREKEEPER');
  console.log('✅ Users seeded');

  // ─── CUSTOMERS ───────────────────────────────────────────────────────────

  const customersData = [
    {
      name: 'Al-Nour Trading Co.',
      phone: '+20-11-2345-6789',
      email: 'purchasing@alnour.com',
    },
    {
      name: 'Mega Build Contractors',
      phone: '+20-10-9876-5432',
      email: 'orders@megabuild.eg',
    },
    {
      name: 'Cairo Office Supplies',
      phone: '+20-12-5678-9012',
      email: 'supply@cairooffice.com',
    },
    {
      name: 'Delta Industrial Group',
      phone: '+20-11-3456-7890',
      email: 'procurement@deltaind.com',
    },
    {
      name: 'Star Retail Outlets',
      phone: '+20-10-1234-5678',
      email: 'buying@starretail.eg',
    },
    {
      name: 'Heliopolis Market',
      phone: '+20-12-8765-4321',
      email: 'manager@heliopolismarket.com',
    },
    {
      name: 'Upper Egypt Distributors',
      phone: '+20-11-7654-3210',
      email: 'orders@uedist.com',
    },
    {
      name: 'Green Valley Co.',
      phone: '+20-10-4567-8901',
      email: 'info@greenvalley.eg',
    },
  ];

  for (const c of customersData) {
    const existing = await prisma.customer.findFirst({
      where: { email: c.email },
    });
    if (!existing) await prisma.customer.create({ data: c });
  }

  const customers = await prisma.customer.findMany();
  console.log('✅ Customers seeded');

  // ─── SUPPLIERS ───────────────────────────────────────────────────────────

  const suppliersData = [
    {
      name: 'EgyptSteel Import & Export',
      phone: '+20-2-2345-6789',
      email: 'sales@egyptsteel.com',
    },
    {
      name: 'NileTech Electronics',
      phone: '+20-2-9876-5432',
      email: 'orders@niletech.eg',
    },
    {
      name: 'SunPack Packaging Solutions',
      phone: '+20-2-5678-9012',
      email: 'supply@sunpack.com',
    },
    {
      name: 'Mediterranean Chemicals',
      phone: '+20-2-3456-7890',
      email: 'procurement@medchem.com',
    },
    {
      name: 'Delta Plastics Factory',
      phone: '+20-2-1234-5678',
      email: 'sales@deltaplastics.eg',
    },
    {
      name: 'Cairo Timber & Wood',
      phone: '+20-2-8765-4321',
      email: 'orders@cairotimber.com',
    },
  ];

  for (const s of suppliersData) {
    const existing = await prisma.supplier.findFirst({
      where: { email: s.email },
    });
    if (!existing) await prisma.supplier.create({ data: s });
  }

  const suppliers = await prisma.supplier.findMany();
  console.log('✅ Suppliers seeded');

  // ─── PRODUCTS ────────────────────────────────────────────────────────────

  const productsData = [
    {
      sku: 'STL-ROD-10MM',
      name: 'Steel Rod 10mm',
      description: 'High-tensile steel rod, 10mm diameter, 6m length',
      price: 185.0,
      cost: 130.0,
      reorder_level: 50,
    },
    {
      sku: 'STL-ROD-16MM',
      name: 'Steel Rod 16mm',
      description: 'High-tensile steel rod, 16mm diameter, 6m length',
      price: 310.0,
      cost: 220.0,
      reorder_level: 40,
    },
    {
      sku: 'CEM-50KG',
      name: 'Portland Cement 50kg',
      description: 'Portland cement bag, 50kg, Grade 42.5',
      price: 95.0,
      cost: 68.0,
      reorder_level: 100,
    },
    {
      sku: 'PNT-WHT-5L',
      name: 'White Wall Paint 5L',
      description: 'Interior white emulsion paint, washable, 5L',
      price: 210.0,
      cost: 145.0,
      reorder_level: 30,
    },
    {
      sku: 'PNT-EXT-5L',
      name: 'Exterior Paint 5L',
      description: 'Weather-resistant exterior paint, 5L',
      price: 265.0,
      cost: 185.0,
      reorder_level: 25,
    },
    {
      sku: 'PPE-GLOVES-L',
      name: 'Safety Gloves (Large)',
      description: 'Heavy-duty cut-resistant safety gloves, size L',
      price: 45.0,
      cost: 22.0,
      reorder_level: 200,
    },
    {
      sku: 'PPE-HELMET',
      name: 'Safety Helmet',
      description: 'HDPE hard hat, adjustable, EN397 certified',
      price: 120.0,
      cost: 65.0,
      reorder_level: 80,
    },
    {
      sku: 'PIPE-PVC-50',
      name: 'PVC Pipe 50mm x 4m',
      description: 'Schedule 40 PVC pressure pipe, 50mm, 4m',
      price: 88.0,
      cost: 55.0,
      reorder_level: 60,
    },
    {
      sku: 'PIPE-PVC-110',
      name: 'PVC Pipe 110mm x 4m',
      description: 'PVC drainage pipe, 110mm diameter, 4m',
      price: 145.0,
      cost: 98.0,
      reorder_level: 40,
    },
    {
      sku: 'WIRE-CU-2.5',
      name: 'Copper Cable 2.5mm',
      description: 'Single-core copper electrical cable, 2.5mm, 100m',
      price: 980.0,
      cost: 720.0,
      reorder_level: 20,
    },
    {
      sku: 'WIRE-CU-6MM',
      name: 'Copper Cable 6mm',
      description: 'Single-core copper electrical cable, 6mm, 100m',
      price: 2100.0,
      cost: 1550.0,
      reorder_level: 15,
    },
    {
      sku: 'TILE-CER-60',
      name: 'Ceramic Floor Tile 60x60',
      description: 'Glazed ceramic floor tile, 60x60cm, per box (6pcs)',
      price: 320.0,
      cost: 210.0,
      reorder_level: 50,
    },
    {
      sku: 'SAND-FINE-TON',
      name: 'Fine Sand (per ton)',
      description: 'Washed fine sand, suitable for plastering',
      price: 450.0,
      cost: 310.0,
      reorder_level: 20,
    },
    {
      sku: 'DRILL-BIT-SET',
      name: 'Masonry Drill Bit Set',
      description: '13-piece SDS masonry drill bit set',
      price: 375.0,
      cost: 220.0,
      reorder_level: 15,
    },
    {
      sku: 'TAPE-DUCT-50M',
      name: 'Duct Tape 50m Roll',
      description: 'Heavy-duty silver duct tape, 50m x 50mm',
      price: 55.0,
      cost: 28.0,
      reorder_level: 100,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { price: p.price, cost: p.cost, reorder_level: p.reorder_level },
      create: { ...p, is_active: true },
    });
  }

  const products = await prisma.product.findMany();
  const productMap = Object.fromEntries(products.map((p) => [p.sku, p]));
  console.log('✅ Products seeded');

  // ─── SUPPLIER PRODUCTS ───────────────────────────────────────────────────

  const supplierProductLinks = [
    {
      supplier_id: suppliers[0].id,
      product_id: productMap['STL-ROD-10MM'].id,
      supplier_price: 125.0,
      lead_time_days: 3,
      min_order_qty: 50,
    },
    {
      supplier_id: suppliers[0].id,
      product_id: productMap['STL-ROD-16MM'].id,
      supplier_price: 210.0,
      lead_time_days: 3,
      min_order_qty: 30,
    },
    {
      supplier_id: suppliers[1].id,
      product_id: productMap['WIRE-CU-2.5'].id,
      supplier_price: 700.0,
      lead_time_days: 5,
      min_order_qty: 10,
    },
    {
      supplier_id: suppliers[1].id,
      product_id: productMap['WIRE-CU-6MM'].id,
      supplier_price: 1500.0,
      lead_time_days: 5,
      min_order_qty: 5,
    },
    {
      supplier_id: suppliers[1].id,
      product_id: productMap['DRILL-BIT-SET'].id,
      supplier_price: 210.0,
      lead_time_days: 7,
      min_order_qty: 10,
    },
    {
      supplier_id: suppliers[2].id,
      product_id: productMap['TAPE-DUCT-50M'].id,
      supplier_price: 25.0,
      lead_time_days: 2,
      min_order_qty: 100,
    },
    {
      supplier_id: suppliers[3].id,
      product_id: productMap['PNT-WHT-5L'].id,
      supplier_price: 140.0,
      lead_time_days: 4,
      min_order_qty: 20,
    },
    {
      supplier_id: suppliers[3].id,
      product_id: productMap['PNT-EXT-5L'].id,
      supplier_price: 178.0,
      lead_time_days: 4,
      min_order_qty: 20,
    },
    {
      supplier_id: suppliers[4].id,
      product_id: productMap['PIPE-PVC-50'].id,
      supplier_price: 52.0,
      lead_time_days: 2,
      min_order_qty: 50,
    },
    {
      supplier_id: suppliers[4].id,
      product_id: productMap['PIPE-PVC-110'].id,
      supplier_price: 94.0,
      lead_time_days: 2,
      min_order_qty: 30,
    },
    {
      supplier_id: suppliers[5].id,
      product_id: productMap['TILE-CER-60'].id,
      supplier_price: 200.0,
      lead_time_days: 6,
      min_order_qty: 20,
    },
    {
      supplier_id: suppliers[5].id,
      product_id: productMap['SAND-FINE-TON'].id,
      supplier_price: 295.0,
      lead_time_days: 1,
      min_order_qty: 5,
    },
  ];

  for (const link of supplierProductLinks) {
    await prisma.supplierProduct.upsert({
      where: {
        supplier_id_product_id: {
          supplier_id: link.supplier_id,
          product_id: link.product_id,
        },
      },
      update: { supplier_price: link.supplier_price },
      create: link,
    });
  }
  console.log('✅ Supplier-product links seeded');

  // ─── INVENTORY ───────────────────────────────────────────────────────────

  const inventoryData = [
    {
      product_id: productMap['STL-ROD-10MM'].id,
      quantity_on_hand: 320,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['STL-ROD-16MM'].id,
      quantity_on_hand: 180,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['CEM-50KG'].id,
      quantity_on_hand: 850,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['PNT-WHT-5L'].id,
      quantity_on_hand: 140,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['PNT-EXT-5L'].id,
      quantity_on_hand: 95,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['PPE-GLOVES-L'].id,
      quantity_on_hand: 600,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['PPE-HELMET'].id,
      quantity_on_hand: 210,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['PIPE-PVC-50'].id,
      quantity_on_hand: 380,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['PIPE-PVC-110'].id,
      quantity_on_hand: 220,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['WIRE-CU-2.5'].id,
      quantity_on_hand: 55,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['WIRE-CU-6MM'].id,
      quantity_on_hand: 28,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['TILE-CER-60'].id,
      quantity_on_hand: 175,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['SAND-FINE-TON'].id,
      quantity_on_hand: 42,
      reserved_quantity: 0,
    },
    {
      product_id: productMap['DRILL-BIT-SET'].id,
      quantity_on_hand: 8,
      reserved_quantity: 0,
    }, // below reorder level — triggers low stock
    {
      product_id: productMap['TAPE-DUCT-50M'].id,
      quantity_on_hand: 7,
      reserved_quantity: 0,
    }, // below reorder level — triggers low stock
  ];

  for (const inv of inventoryData) {
    await prisma.inventory.upsert({
      where: {
        product_id_warehouse_id: {
          product_id: inv.product_id,
          warehouse_id: warehouse.id,
        },
      },
      update: { quantity_on_hand: inv.quantity_on_hand },
      create: { ...inv, warehouse_id: warehouse.id },
    });
  }
  console.log('✅ Inventory seeded');

  // ─── ORDERS & ORDER ITEMS ─────────────────────────────────────────────────
  //
  // Strategy:
  //   SALE    + COMPLETED  → 8 orders  (invoice PAID or UNPAID)
  //   SALE    + PENDING    → 6 orders  (reserved stock)
  //   SALE    + CANCELLED  → 6 orders  (no stock impact)
  //   PURCHASE + COMPLETED → 6 orders  (stock received)
  //   PURCHASE + PENDING   → 4 orders  (awaiting delivery)
  //   PURCHASE + CANCELLED → 2 orders
  //   Total: 32 orders — well above the 20 minimum
  //   Every enum value has >= 6 records.
  //
  // We only create orders that don't already exist (idempotent via notes tag).

  type OrderSeed = {
    type: OrderType;
    status: OrderStatus;
    notes: string;
    customer_id?: number;
    supplier_id?: number;
    created_by: number;
    items: { sku: string; qty: number }[];
    invoiceStatus?: InvoiceStatus;
    paid?: boolean;
  };

  const orderSeeds: OrderSeed[] = [
    // ── SALE / COMPLETED ──────────────────────────────────────────────────
    {
      type: OrderType.SALE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-001] Bulk cement and steel order for Mega Build',
      customer_id: customers[1].id,
      created_by: salesUsers[0].id,
      items: [
        { sku: 'CEM-50KG', qty: 80 },
        { sku: 'STL-ROD-10MM', qty: 40 },
      ],
      invoiceStatus: InvoiceStatus.PAID,
      paid: true,
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-002] Paint and safety equipment for Al-Nour',
      customer_id: customers[0].id,
      created_by: salesUsers[1].id,
      items: [
        { sku: 'PNT-WHT-5L', qty: 30 },
        { sku: 'PPE-HELMET', qty: 20 },
      ],
      invoiceStatus: InvoiceStatus.PAID,
      paid: true,
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-003] Piping and cable for Delta Industrial',
      customer_id: customers[3].id,
      created_by: salesUsers[0].id,
      items: [
        { sku: 'PIPE-PVC-50', qty: 60 },
        { sku: 'WIRE-CU-2.5', qty: 8 },
      ],
      invoiceStatus: InvoiceStatus.PAID,
      paid: true,
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-004] Tiles and cement for Heliopolis Market',
      customer_id: customers[5].id,
      created_by: salesUsers[2].id,
      items: [
        { sku: 'TILE-CER-60', qty: 40 },
        { sku: 'CEM-50KG', qty: 50 },
      ],
      invoiceStatus: InvoiceStatus.PAID,
      paid: true,
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-005] Safety gear bulk order for Star Retail',
      customer_id: customers[4].id,
      created_by: salesUsers[1].id,
      items: [
        { sku: 'PPE-GLOVES-L', qty: 100 },
        { sku: 'PPE-HELMET', qty: 50 },
      ],
      invoiceStatus: InvoiceStatus.UNPAID,
      paid: false,
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-006] Exterior paint order for Green Valley',
      customer_id: customers[7].id,
      created_by: salesUsers[0].id,
      items: [
        { sku: 'PNT-EXT-5L', qty: 25 },
        { sku: 'TAPE-DUCT-50M', qty: 20 },
      ],
      invoiceStatus: InvoiceStatus.UNPAID,
      paid: false,
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-007] Drainage pipe and fittings for Upper Egypt Dist.',
      customer_id: customers[6].id,
      created_by: salesUsers[2].id,
      items: [
        { sku: 'PIPE-PVC-110', qty: 45 },
        { sku: 'PIPE-PVC-50', qty: 30 },
      ],
      invoiceStatus: InvoiceStatus.UNPAID,
      paid: false,
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-008] Steel rods for Cairo Office Supplies renovation',
      customer_id: customers[2].id,
      created_by: salesUsers[0].id,
      items: [
        { sku: 'STL-ROD-16MM', qty: 35 },
        { sku: 'STL-ROD-10MM', qty: 50 },
      ],
      invoiceStatus: InvoiceStatus.UNPAID,
      paid: false,
    },

    // ── SALE / PENDING ───────────────────────────────────────────────────
    {
      type: OrderType.SALE,
      status: OrderStatus.PENDING,
      notes: '[SEED-009] Pending cement order for Mega Build phase 2',
      customer_id: customers[1].id,
      created_by: salesUsers[1].id,
      items: [
        { sku: 'CEM-50KG', qty: 60 },
        { sku: 'SAND-FINE-TON', qty: 5 },
      ],
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.PENDING,
      notes: '[SEED-010] Pending copper cable order for Delta Industrial',
      customer_id: customers[3].id,
      created_by: salesUsers[0].id,
      items: [
        { sku: 'WIRE-CU-2.5', qty: 5 },
        { sku: 'WIRE-CU-6MM', qty: 3 },
      ],
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.PENDING,
      notes: '[SEED-011] Pending PPE order for Al-Nour Trading',
      customer_id: customers[0].id,
      created_by: salesUsers[2].id,
      items: [
        { sku: 'PPE-GLOVES-L', qty: 80 },
        { sku: 'PPE-HELMET', qty: 30 },
      ],
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.PENDING,
      notes: '[SEED-012] Pending tile order for Heliopolis Market',
      customer_id: customers[5].id,
      created_by: salesUsers[1].id,
      items: [{ sku: 'TILE-CER-60', qty: 25 }],
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.PENDING,
      notes: '[SEED-013] Pending paint order for Green Valley Co.',
      customer_id: customers[7].id,
      created_by: salesUsers[0].id,
      items: [
        { sku: 'PNT-WHT-5L', qty: 15 },
        { sku: 'PNT-EXT-5L', qty: 12 },
      ],
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.PENDING,
      notes: '[SEED-014] Pending steel rod order for Star Retail',
      customer_id: customers[4].id,
      created_by: salesUsers[2].id,
      items: [
        { sku: 'STL-ROD-10MM', qty: 20 },
        { sku: 'STL-ROD-16MM', qty: 15 },
      ],
    },

    // ── SALE / CANCELLED ─────────────────────────────────────────────────
    {
      type: OrderType.SALE,
      status: OrderStatus.CANCELLED,
      notes: '[SEED-015] Cancelled — customer requested price revision',
      customer_id: customers[2].id,
      created_by: salesUsers[1].id,
      items: [
        { sku: 'WIRE-CU-6MM', qty: 4 },
        { sku: 'DRILL-BIT-SET', qty: 5 },
      ],
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.CANCELLED,
      notes: '[SEED-016] Cancelled — delivery location changed',
      customer_id: customers[6].id,
      created_by: salesUsers[0].id,
      items: [{ sku: 'PIPE-PVC-110', qty: 30 }],
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.CANCELLED,
      notes: '[SEED-017] Cancelled — customer found alternative supplier',
      customer_id: customers[0].id,
      created_by: salesUsers[2].id,
      items: [
        { sku: 'CEM-50KG', qty: 100 },
        { sku: 'SAND-FINE-TON', qty: 8 },
      ],
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.CANCELLED,
      notes: '[SEED-018] Cancelled — duplicate order entered in error',
      customer_id: customers[3].id,
      created_by: salesUsers[1].id,
      items: [{ sku: 'STL-ROD-10MM', qty: 25 }],
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.CANCELLED,
      notes:
        '[SEED-019] Cancelled — product out of spec for customer requirements',
      customer_id: customers[7].id,
      created_by: salesUsers[0].id,
      items: [
        { sku: 'TILE-CER-60', qty: 20 },
        { sku: 'PNT-WHT-5L', qty: 10 },
      ],
    },
    {
      type: OrderType.SALE,
      status: OrderStatus.CANCELLED,
      notes: '[SEED-020] Cancelled — payment terms not agreed',
      customer_id: customers[4].id,
      created_by: salesUsers[2].id,
      items: [
        { sku: 'PPE-GLOVES-L', qty: 50 },
        { sku: 'PPE-HELMET', qty: 20 },
      ],
    },

    // ── PURCHASE / COMPLETED ─────────────────────────────────────────────
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-021] Steel rod restock from EgyptSteel',
      supplier_id: suppliers[0].id,
      created_by: storekeeperUsers[0].id,
      items: [
        { sku: 'STL-ROD-10MM', qty: 200 },
        { sku: 'STL-ROD-16MM', qty: 100 },
      ],
    },
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-022] Electrical cable restock from NileTech',
      supplier_id: suppliers[1].id,
      created_by: storekeeperUsers[1].id,
      items: [
        { sku: 'WIRE-CU-2.5', qty: 30 },
        { sku: 'WIRE-CU-6MM', qty: 15 },
      ],
    },
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-023] PVC pipe restock from Delta Plastics',
      supplier_id: suppliers[4].id,
      created_by: storekeeperUsers[0].id,
      items: [
        { sku: 'PIPE-PVC-50', qty: 150 },
        { sku: 'PIPE-PVC-110', qty: 80 },
      ],
    },
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-024] Paint restock from Mediterranean Chemicals',
      supplier_id: suppliers[3].id,
      created_by: storekeeperUsers[2].id,
      items: [
        { sku: 'PNT-WHT-5L', qty: 80 },
        { sku: 'PNT-EXT-5L', qty: 60 },
      ],
    },
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-025] Tiles restock from Cairo Timber & Wood',
      supplier_id: suppliers[5].id,
      created_by: storekeeperUsers[1].id,
      items: [
        { sku: 'TILE-CER-60', qty: 100 },
        { sku: 'SAND-FINE-TON', qty: 20 },
      ],
    },
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.COMPLETED,
      notes: '[SEED-026] Consumables restock from SunPack',
      supplier_id: suppliers[2].id,
      created_by: storekeeperUsers[0].id,
      items: [
        { sku: 'TAPE-DUCT-50M', qty: 200 },
        { sku: 'PPE-GLOVES-L', qty: 300 },
      ],
    },

    // ── PURCHASE / PENDING ───────────────────────────────────────────────
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.PENDING,
      notes: '[SEED-027] Pending drill bit restock from NileTech',
      supplier_id: suppliers[1].id,
      created_by: storekeeperUsers[2].id,
      items: [{ sku: 'DRILL-BIT-SET', qty: 30 }],
    },
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.PENDING,
      notes: '[SEED-028] Pending helmet restock from SunPack',
      supplier_id: suppliers[2].id,
      created_by: storekeeperUsers[0].id,
      items: [{ sku: 'PPE-HELMET', qty: 100 }],
    },
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.PENDING,
      notes: '[SEED-029] Pending cement bulk order',
      supplier_id: suppliers[0].id,
      created_by: storekeeperUsers[1].id,
      items: [{ sku: 'CEM-50KG', qty: 500 }],
    },
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.PENDING,
      notes: '[SEED-030] Pending copper cable large order from NileTech',
      supplier_id: suppliers[1].id,
      created_by: storekeeperUsers[2].id,
      items: [
        { sku: 'WIRE-CU-2.5', qty: 20 },
        { sku: 'WIRE-CU-6MM', qty: 10 },
      ],
    },

    // ── PURCHASE / CANCELLED ─────────────────────────────────────────────
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.CANCELLED,
      notes: '[SEED-031] Cancelled — supplier could not meet delivery date',
      supplier_id: suppliers[5].id,
      created_by: storekeeperUsers[0].id,
      items: [{ sku: 'TILE-CER-60', qty: 50 }],
    },
    {
      type: OrderType.PURCHASE,
      status: OrderStatus.CANCELLED,
      notes: '[SEED-032] Cancelled — price increase above approved budget',
      supplier_id: suppliers[3].id,
      created_by: storekeeperUsers[1].id,
      items: [
        { sku: 'PNT-EXT-5L', qty: 40 },
        { sku: 'PNT-WHT-5L', qty: 40 },
      ],
    },
  ];

  // Process each order seed
  for (const seed of orderSeeds) {
    // Idempotency check: use the [SEED-XXX] tag in notes
    const seedTag = seed.notes.match(/\[SEED-\d+\]/)?.[0];
    if (!seedTag) continue;

    const existing = await prisma.order.findFirst({
      where: { notes: { contains: seedTag } },
    });
    if (existing) continue;

    // ── Build items with price/cost snapshots ──
    const itemsWithSnapshots = seed.items.map((i) => {
      const product = productMap[i.sku];
      return {
        product_id: product.id,
        quantity: i.qty,
        price_snapshot: product.price,
        cost_snapshot: product.cost,
      };
    });

    // ── Calculate total server-side ──
    const total = itemsWithSnapshots.reduce(
      (sum, item) => sum + Number(item.price_snapshot) * item.quantity,
      0,
    );

    // ── Create the order with items ──
    const order = await prisma.order.create({
      data: {
        type: seed.type,
        status: seed.status,
        total,
        notes: seed.notes,
        customer_id: seed.customer_id ?? null,
        supplier_id: seed.supplier_id ?? null,
        created_by: seed.created_by,
        items: { createMany: { data: itemsWithSnapshots } },
      },
    });

    // ── Handle stock and movements ──

    if (seed.type === OrderType.SALE) {
      if (seed.status === OrderStatus.COMPLETED) {
        // Decrease quantity_on_hand (already sold)
        for (const item of itemsWithSnapshots) {
          await prisma.inventory.updateMany({
            where: { product_id: item.product_id, warehouse_id: warehouse.id },
            data: { quantity_on_hand: { decrement: item.quantity } },
          });
          await prisma.inventoryMovement.create({
            data: {
              product_id: item.product_id,
              warehouse_id: warehouse.id,
              order_id: order.id,
              type: MovementType.OUT,
              quantity_change: -item.quantity,
              reason: 'Sale order completed',
              created_by: seed.created_by,
            },
          });
        }
        // Create invoice
        const invoiceNumber = `INV-${String(order.id).padStart(5, '0')}`;
        await prisma.invoice.create({
          data: {
            invoice_number: invoiceNumber,
            order_id: order.id,
            status: seed.invoiceStatus ?? InvoiceStatus.UNPAID,
            paid_at: seed.paid ? new Date() : null,
          },
        });
      } else if (seed.status === OrderStatus.PENDING) {
        // Reserve stock only
        for (const item of itemsWithSnapshots) {
          await prisma.inventory.updateMany({
            where: { product_id: item.product_id, warehouse_id: warehouse.id },
            data: { reserved_quantity: { increment: item.quantity } },
          });
        }
      }
      // CANCELLED: no stock change needed
    } else if (seed.type === OrderType.PURCHASE) {
      if (seed.status === OrderStatus.COMPLETED) {
        // Increase quantity_on_hand (stock received)
        for (const item of itemsWithSnapshots) {
          await prisma.inventory.updateMany({
            where: { product_id: item.product_id, warehouse_id: warehouse.id },
            data: { quantity_on_hand: { increment: item.quantity } },
          });
          await prisma.inventoryMovement.create({
            data: {
              product_id: item.product_id,
              warehouse_id: warehouse.id,
              order_id: order.id,
              type: MovementType.IN,
              quantity_change: item.quantity,
              reason: 'Purchase order received',
              created_by: seed.created_by,
            },
          });
        }
      }
      // PENDING / CANCELLED: no stock change
    }
  }

  console.log('✅ Orders, items, invoices, and movements seeded');

  // ─── INVENTORY ADJUSTMENTS ────────────────────────────────────────────────
  // Add a few ADJUSTMENT movements to cover the enum value with >= 6 records.

  const adjustments = [
    {
      sku: 'CEM-50KG',
      change: -5,
      reason: 'Stock count correction — 5 bags damaged',
    },
    {
      sku: 'PPE-GLOVES-L',
      change: -12,
      reason: 'Stock count correction — gloves worn during internal use',
    },
    {
      sku: 'TAPE-DUCT-50M',
      change: +15,
      reason: 'Stock count correction — rolls found in secondary storage',
    },
    {
      sku: 'TILE-CER-60',
      change: -3,
      reason: 'Stock count correction — breakage during handling',
    },
    {
      sku: 'STL-ROD-10MM',
      change: +8,
      reason: 'Stock count correction — returned from cancelled site project',
    },
    {
      sku: 'PIPE-PVC-50',
      change: -6,
      reason: 'Stock count correction — pipes transferred to branch',
    },
  ];

  for (const adj of adjustments) {
    const product = productMap[adj.sku];

    // Check if this adjustment already exists (idempotency)
    const existingAdj = await prisma.inventoryMovement.findFirst({
      where: {
        product_id: product.id,
        type: MovementType.ADJUSTMENT,
        reason: adj.reason,
      },
    });
    if (existingAdj) continue;

    await prisma.inventoryMovement.create({
      data: {
        product_id: product.id,
        warehouse_id: warehouse.id,
        type: MovementType.ADJUSTMENT,
        quantity_change: adj.change,
        reason: adj.reason,
        created_by: adminUser.id,
      },
    });

    await prisma.inventory.updateMany({
      where: { product_id: product.id, warehouse_id: warehouse.id },
      data: { quantity_on_hand: { increment: adj.change } },
    });
  }

  console.log('✅ Inventory adjustments seeded');

  // ─── SUMMARY ─────────────────────────────────────────────────────────────

  const [
    roleCount,
    userCount,
    productCount,
    customerCount,
    supplierCount,
    orderCount,
    invoiceCount,
    movementCount,
    inventoryCount,
  ] = await Promise.all([
    prisma.role.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.customer.count(),
    prisma.supplier.count(),
    prisma.order.count(),
    prisma.invoice.count(),
    prisma.inventoryMovement.count(),
    prisma.inventory.count(),
  ]);

  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
  });
  const ordersByType = await prisma.order.groupBy({
    by: ['type'],
    _count: true,
  });
  const invoicesByStatus = await prisma.invoice.groupBy({
    by: ['status'],
    _count: true,
  });
  const movementsByType = await prisma.inventoryMovement.groupBy({
    by: ['type'],
    _count: true,
  });

  console.log('\n📊 Seed Summary:');
  console.log(`   Roles:      ${roleCount}`);
  console.log(`   Users:      ${userCount}`);
  console.log(`   Products:   ${productCount}`);
  console.log(`   Customers:  ${customerCount}`);
  console.log(`   Suppliers:  ${supplierCount}`);
  console.log(`   Inventory:  ${inventoryCount} rows`);
  console.log(`   Orders:     ${orderCount}`);
  console.log(`   Invoices:   ${invoiceCount}`);
  console.log(`   Movements:  ${movementCount}`);

  console.log('\n   Orders by status:');
  ordersByStatus.forEach((r) =>
    console.log(`     ${r.status.padEnd(10)} ${r._count}`),
  );

  console.log('\n   Orders by type:');
  ordersByType.forEach((r) =>
    console.log(`     ${r.type.padEnd(10)} ${r._count}`),
  );

  console.log('\n   Invoices by status:');
  invoicesByStatus.forEach((r) =>
    console.log(`     ${r.status.padEnd(10)} ${r._count}`),
  );

  console.log('\n   Movements by type:');
  movementsByType.forEach((r) =>
    console.log(`     ${r.type.padEnd(12)} ${r._count}`),
  );

  console.log('\n✅ Seed complete.');
  console.log('   Admin login: admin@stockflow.com / Password@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
