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
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { QueryPhotosDto } from './dto/query-photos.dto';
import { BatchSyncPhotosDto } from './dto/batch-sync-photos.dto';

@ApiTags('photos')
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @ApiOperation({ summary: 'Create or upsert a photo record' })
  @ApiResponse({ status: 201, description: 'Photo created/upserted successfully.' })
  async create(@Body() createPhotoDto: CreatePhotoDto) {
    return this.photosService.create(createPhotoDto);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Batch sync offline photos queue' })
  @ApiResponse({ status: 201, description: 'Batch photos synced successfully.' })
  async batchSync(@Body() batchSyncPhotosDto: BatchSyncPhotosDto) {
    return this.photosService.batchSync(batchSyncPhotosDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get photos with pagination, filtering, search and sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of photos.' })
  async findAll(@Query() queryDto: QueryPhotosDto) {
    return this.photosService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get photo by ID with optional userId filter' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'User ID filter' })
  @ApiResponse({ status: 200, description: 'Photo details.' })
  @ApiResponse({ status: 404, description: 'Photo not found.' })
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ) {
    return this.photosService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a photo record' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'User ID filter' })
  @ApiResponse({ status: 200, description: 'Photo updated successfully.' })
  @ApiResponse({ status: 404, description: 'Photo not found.' })
  async update(
    @Param('id') id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
    @Query('userId') userId?: string,
  ) {
    return this.photosService.update(id, updatePhotoDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a photo record' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'User ID filter' })
  @ApiResponse({ status: 200, description: 'Photo deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Photo not found.' })
  async remove(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ) {
    return this.photosService.remove(id, userId);
  }
}


