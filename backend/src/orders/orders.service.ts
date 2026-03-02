import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  MovementType,
  OrderStatus,
  OrderType,
} from 'src/generated/prisma/enums';

const DEFAULT_WAREHOUSE_ID = Number(process.env.DEFAULT_WAREHOUSE_ID) || 1;
@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, type?: OrderType, status?: OrderStatus) {
    const skip = (page - 1) * limit;

    const where = {
      ...(type && { type }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          customer: true,
          supplier: true,
          invoice: true,
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: true,
        supplier: true,
        invoice: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  async create(dto: CreateOrderDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      // ── Step 1: Validate stock availability
      // Lock each inventory row first to prevent race conditions,
      // then check if enough stock is available.
      for (const item of dto.items) {
        await tx.$executeRaw`
          SELECT id FROM "Inventory"
          WHERE product_id = ${item.product_id}
          FOR UPDATE
        `;

        const inventory = await tx.inventory.findFirst({
          where: { product_id: item.product_id },
        });

        if (!inventory) {
          throw new NotFoundException(
            `Product ${item.product_id} not found in inventory`,
          );
        }

        const available =
          inventory.quantity_on_hand - inventory.reserved_quantity;

        if (available < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.product_id}. ` +
              `Available: ${available}, Requested: ${item.quantity}`,
          );
        }
      }

      // ── Step 2: Reserve stock
      for (const item of dto.items) {
        await tx.inventory.updateMany({
          where: { product_id: item.product_id },
          data: { reserved_quantity: { increment: item.quantity } },
        });
      }

      // ── Step 3: Fetch product prices server-side
      const productIds = dto.items.map((i) => i.product_id);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

      // ── Calculate total before creating the order
      const total = dto.items.reduce((sum, item) => {
        const unitValue =
          dto.type === OrderType.SALE
            ? Number(productMap[item.product_id].price)
            : Number(productMap[item.product_id].cost);
        return sum + unitValue * item.quantity;
      }, 0);

      // ── Step 4: Create order with items, snapshots, and total
      return tx.order.create({
        data: {
          type: dto.type,
          status: 'PENDING',
          total,
          notes: dto.notes ?? null,
          customer_id: dto.customer_id ?? null,
          supplier_id: dto.supplier_id ?? null,
          created_by: userId,
          items: {
            create: dto.items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price_snapshot: productMap[item.product_id].price,
              cost_snapshot: productMap[item.product_id].cost,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          customer: true,
          supplier: true,
        },
      });
    });
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      // ── Step 1: Fetch order + items
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) throw new NotFoundException(`Order ${id} not found`);

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          `Only PENDING orders can be updated. Current status: ${order.status}`,
        );
      }

      // ── COMPLETE ────────────────────────────────────────────────────────
      if (dto.status === OrderStatus.COMPLETED) {
        for (const item of order.items) {
          // Step 2: Lock the inventory row
          await tx.$executeRaw`
          SELECT id FROM "Inventory"
          WHERE product_id = ${item.product_id}
          FOR UPDATE
        `;

          // Steps 3 & 4: Decrement quantity_on_hand and reserved_quantity
          await tx.inventory.updateMany({
            where: { product_id: item.product_id },
            data: {
              quantity_on_hand: { decrement: item.quantity },
              reserved_quantity: { decrement: item.quantity },
            },
          });

          // Step 5: Audit trail
          await tx.inventoryMovement.create({
            data: {
              product_id: item.product_id,
              warehouse_id: DEFAULT_WAREHOUSE_ID,
              order_id: order.id,
              type: MovementType.OUT,
              quantity_change: -item.quantity,
              reason: 'Sale order completed',
              created_by: userId,
            },
          });
        }

        // Step 6: Update order status → COMPLETED
        await tx.order.update({
          where: { id },
          data: { status: dto.status },
        });

        // Step 7: Create Invoice (UNPAID)
        await tx.invoice.create({
          data: {
            order_id: order.id,
            invoice_number: `INV-${String(order.id).padStart(5, '0')}`,
            status: 'UNPAID',
          },
        });

        return tx.order.findUnique({
          where: { id },
          include: {
            items: { include: { product: true } },
            customer: true,
            supplier: true,
            invoice: true,
          },
        });
      }

      // ── CANCEL ──────────────────────────────────────────────────────────
      if (dto.status === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await tx.inventory.updateMany({
            where: { product_id: item.product_id },
            data: { reserved_quantity: { decrement: item.quantity } },
          });
        }

        // Update order status → CANCELLED
        return tx.order.update({
          where: { id },
          data: { status: dto.status },
          include: {
            items: { include: { product: true } },
            customer: true,
            supplier: true,
          },
        });
      }
    });
  }
}
