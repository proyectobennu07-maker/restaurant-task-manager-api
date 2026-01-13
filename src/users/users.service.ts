import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<User & { role: { name: string } }> {
    return this.prisma.user.create({
      data: createUserDto,
      include: { role: true },
    });
  }

  async findAll(): Promise<(User & { role: { name: string } })[]> {
    return this.prisma.user.findMany({
      include: { role: true },
    });
  }

  async findOne(id: string): Promise<User & { role: { name: string } }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User & { role: { name: string } }> {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: { role: true },
    });
  }

  async remove(id: string): Promise<User> {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * 🔐 Método usado por AuthService
   * Tipado explícito para evitar `any` y errores ESLint
   */
  async findByEmail(
    email: string,
  ): Promise<(User & { role: { name: string } }) | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }
}
