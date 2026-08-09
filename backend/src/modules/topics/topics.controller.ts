import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@ApiTags('topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiResponse({ status: 201, description: 'Topic created successfully.' })
  async create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicsService.create(createTopicDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all topics with optional filters' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category ID' })
  @ApiResponse({ status: 200, description: 'List of topics.' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.topicsService.findAll(userId, categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by ID' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'Topic details.' })
  @ApiResponse({ status: 404, description: 'Topic not found.' })
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ) {
    return this.topicsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a topic' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'Topic updated successfully.' })
  @ApiResponse({ status: 404, description: 'Topic not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @Query('userId') userId?: string,
  ) {
    return this.topicsService.update(id, updateTopicDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'Topic deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Topic not found.' })
  async remove(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ) {
    return this.topicsService.remove(id, userId);
  }
}

