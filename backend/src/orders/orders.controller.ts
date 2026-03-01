import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

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

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}
