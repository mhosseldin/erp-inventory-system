import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    console.log('USER FOUND:', user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User is deactivated');
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    console.log('USER PASSWORD VALID');

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
      console.log('USER PASSWORD IS NOT VALID');
    }

    const payload = {
      sub: user.id,
      role: user.role.name,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    };
  }
}
