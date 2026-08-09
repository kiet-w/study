import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { QueryPhotosDto, PhotoSortBy, SortOrder } from './dto/query-photos.dto';
import { BatchSyncPhotosDto } from './dto/batch-sync-photos.dto';

@Injectable()
export class PhotosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPhotoDto: CreatePhotoDto) {
    const data = {
      ...createPhotoDto,
      synced: createPhotoDto.synced ?? true,
    };

    if (createPhotoDto.id) {
      return this.prisma.photo.upsert({
        where: { id: createPhotoDto.id },
        create: data,
        update: {
          categoryId: data.categoryId,
          topicId: data.topicId,
          storagePath: data.storagePath,
          thumbnailPath: data.thumbnailPath,
          note: data.note,
          takenAt: data.takenAt,
          sortOrder: data.sortOrder,
          synced: true,
        },
        include: {
          category: true,
          topic: true,
        },
      });
    }

    return this.prisma.photo.create({
      data,
      include: {
        category: true,
        topic: true,
      },
    });
  }

  async batchSync(batchDto: BatchSyncPhotosDto) {
    const results = await this.prisma.$transaction(
      batchDto.photos.map((photoDto) => {
        const data = {
          ...photoDto,
          synced: true,
        };

        if (photoDto.id) {
          return this.prisma.photo.upsert({
            where: { id: photoDto.id },
            create: data,
            update: {
              categoryId: data.categoryId,
              topicId: data.topicId,
              storagePath: data.storagePath,
              thumbnailPath: data.thumbnailPath,
              note: data.note,
              takenAt: data.takenAt,
              sortOrder: data.sortOrder,
              synced: true,
            },
            include: {
              category: true,
              topic: true,
            },
          });
        }

        return this.prisma.photo.create({
          data,
          include: {
            category: true,
            topic: true,
          },
        });
      }),
    );

    return {
      syncedCount: results.length,
      items: results,
    };
  }

  async findAll(queryDto: QueryPhotosDto) {
    const {
      userId,
      categoryId,
      topicId,
      synced,
      search,
      startDate,
      endDate,
      sortBy = PhotoSortBy.TAKEN_AT,
      order = SortOrder.DESC,
      page = 1,
      limit = 20,
    } = queryDto;

    const skip = (page - 1) * limit;

    const where: Prisma.PhotoWhereInput = {
      ...(userId && { userId }),
      ...(categoryId && { categoryId }),
      ...(topicId && { topicId }),
      ...(synced !== undefined && { synced }),
      ...(search && {
        note: {
          contains: search,
          mode: 'insensitive',
        },
      }),
      ...((startDate || endDate) && {
        takenAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      }),
    };

    const orderBy: Prisma.PhotoOrderByWithRelationInput = {
      [sortBy]: order,
    };

    const [items, total] = await Promise.all([
      this.prisma.photo.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
      totalPages: Math.ceil(total / limit),
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

