import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma-client/enums';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiPropertyOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
