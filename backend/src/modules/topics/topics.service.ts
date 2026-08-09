import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTopicDto: CreateTopicDto) {
    if (createTopicDto.id) {
      return this.prisma.topic.upsert({
        where: { id: createTopicDto.id },
        create: createTopicDto,
        update: {
          categoryId: createTopicDto.categoryId,
          name: createTopicDto.name,
          color: createTopicDto.color,
          icon: createTopicDto.icon,
          sortOrder: createTopicDto.sortOrder,
        },
      });
    }
    return this.prisma.topic.create({
      data: createTopicDto,
    });
  }

  async findAll(userId?: string, categoryId?: string) {
    return this.prisma.topic.findMany({
      where: {
        ...(userId && { userId }),
        ...(categoryId && { categoryId }),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        category: true,
        _count: {
          select: { photos: true },
        },
      },
    });
  }

  async findOne(id: string, userId?: string) {
    const topic = await this.prisma.topic.findFirst({
      where: {
        id,
        ...(userId && { userId }),
      },
      include: {
        category: true,
        _count: {
          select: { photos: true },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    return topic;
  }

  async update(id: string, updateTopicDto: UpdateTopicDto, userId?: string) {
    await this.findOne(id, userId);
    return this.prisma.topic.update({
      where: { id },
      data: updateTopicDto,
      include: {
        category: true,
        _count: {
          select: { photos: true },
        },
      },
    });
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id, userId);
    return this.prisma.topic.delete({
      where: { id },
    });
  }
}


