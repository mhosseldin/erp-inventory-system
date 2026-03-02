import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma-client/enums';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['COMPLETED', 'CANCELLED'] })
  @IsEnum([OrderStatus.COMPLETED, OrderStatus.CANCELLED], {
    message: 'Status must be either COMPLETED or CANCELLED',
  })
  status: 'COMPLETED' | 'CANCELLED';
}
