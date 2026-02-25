import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  sku: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  stock_quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
