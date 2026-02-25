import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsInt,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ahmed Ali' })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({ example: 'ahmed@stockflow.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  role_id: number;
}
