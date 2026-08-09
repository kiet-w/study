import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTopicDto: CreateTopicDto) {
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
      orderBy: { sortOrder: 'asc' },
      include: {
        category: true,
      },
    });
  }

  async findOne(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    return topic;
  }

  async update(id: string, updateTopicDto: UpdateTopicDto) {
    await this.findOne(id);
    return this.prisma.topic.update({
      where: { id },
      data: updateTopicDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.topic.delete({
      where: { id },
    });
  }
}
