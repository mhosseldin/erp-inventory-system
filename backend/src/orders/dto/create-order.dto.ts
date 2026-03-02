import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '@prisma-client/enums';

export class OrderItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  product_id: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  // Required when type is SALE
  @ApiProperty({ required: false })
  @ValidateIf((o) => o.type === OrderType.SALE)
  @IsInt()
  customer_id?: number;

  // Required when type is PURCHASE
  @ApiProperty({ required: false })
  @ValidateIf((o) => o.type === OrderType.PURCHASE)
  @IsInt()
  supplier_id?: number;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
