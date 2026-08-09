import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.id) {
      return this.prisma.user.upsert({
        where: { id: createUserDto.id },
        create: {
          id: createUserDto.id,
          email: createUserDto.email,
          fullName: createUserDto.fullName,
          avatarUrl: createUserDto.avatarUrl,
        },
        update: {
          email: createUserDto.email,
          fullName: createUserDto.fullName,
          avatarUrl: createUserDto.avatarUrl,
        },
      });
    }

    return this.prisma.user.upsert({
      where: { email: createUserDto.email },
      create: {
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        avatarUrl: createUserDto.avatarUrl,
      },
      update: {
        fullName: createUserDto.fullName,
        avatarUrl: createUserDto.avatarUrl,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            categories: true,
            topics: true,
            photos: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            categories: true,
            topics: true,
            photos: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
