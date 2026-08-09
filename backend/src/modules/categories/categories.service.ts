import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    if (createCategoryDto.id) {
      return this.prisma.category.upsert({
        where: { id: createCategoryDto.id },
        create: createCategoryDto,
        update: {
          name: createCategoryDto.name,
          color: createCategoryDto.color,
          icon: createCategoryDto.icon,
          sortOrder: createCategoryDto.sortOrder,
        },
      });
    }
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(userId?: string) {
    return this.prisma.category.findMany({
      where: userId ? { userId } : {},
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        topics: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            topics: true,
            photos: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId?: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        ...(userId && { userId }),
      },
      include: {
        topics: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            topics: true,
            photos: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId?: string) {
    await this.findOne(id, userId);
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        topics: true,
        _count: {
          select: {
            topics: true,
            photos: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id, userId);
    return this.prisma.category.delete({
      where: { id },
    });
  }
}


