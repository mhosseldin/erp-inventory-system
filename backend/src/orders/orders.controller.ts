import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  Body,
  UseGuards,
  Post,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.ordersService.findAll(Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SALES')
  @ApiOperation({ summary: 'Create a new order (PENDING)' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: { userId: number }) {
    return this.ordersService.create(dto, user.userId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update order status (COMPLETED or CANCELLED)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: { userId: number },
  ) {
    return this.ordersService.updateStatus(id, dto, user.userId);
  }
}
