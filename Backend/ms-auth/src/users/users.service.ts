import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RoleName } from '../common/enums/role.enum';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async createUsuario(data: { dni: number; username: string; email: string; password: string }) {
    const role = await this.prisma.role.findUniqueOrThrow({
      where: { name: RoleName.USUARIO },
    });
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        dni: data.dni,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        roleId: role.id,
      },
      include: { role: true },
    });
  }

  async validatePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}