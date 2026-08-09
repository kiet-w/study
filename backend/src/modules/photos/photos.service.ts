import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { QueryPhotosDto } from './dto/query-photos.dto';

@Injectable()
export class PhotosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPhotoDto: CreatePhotoDto) {
    return this.prisma.photo.create({
      data: createPhotoDto,
      include: {
        category: true,
        topic: true,
      },
    });
  }

  async findAll(queryDto: QueryPhotosDto) {
    const { userId, categoryId, topicId, synced, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.PhotoWhereInput = {
      ...(userId && { userId }),
      ...(categoryId && { categoryId }),
      ...(topicId && { topicId }),
      ...(synced !== undefined && { synced }),
    };

    const [items, total] = await Promise.all([
      this.prisma.photo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { takenAt: 'desc' },
        include: {
          category: true,
          topic: true,
        },
      }),
      this.prisma.photo.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
      include: {
        category: true,
        topic: true,
      },
    });

    if (!photo) {
      throw new NotFoundException(`Photo with ID ${id} not found`);
    }

    return photo;
  }

  async update(id: string, updatePhotoDto: UpdatePhotoDto) {
    await this.findOne(id);
    return this.prisma.photo.update({
      where: { id },
      data: updatePhotoDto,
      include: {
        category: true,
        topic: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.photo.delete({
      where: { id },
    });
  }
}
