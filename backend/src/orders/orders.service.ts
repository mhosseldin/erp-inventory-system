import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma-client/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.order.count(),
    ]);

    return {
      data,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) throw new NotFoundException('Product not found');

    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Product not found');

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot update cancelled order');
    }

    return await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
