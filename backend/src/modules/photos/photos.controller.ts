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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { QueryPhotosDto } from './dto/query-photos.dto';

@ApiTags('photos')
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new photo record' })
  @ApiResponse({ status: 201, description: 'Photo created successfully.' })
  async create(@Body() createPhotoDto: CreatePhotoDto) {
    return this.photosService.create(createPhotoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get photos with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of photos.' })
  async findAll(@Query() queryDto: QueryPhotosDto) {
    return this.photosService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get photo by ID' })
  @ApiResponse({ status: 200, description: 'Photo details.' })
  @ApiResponse({ status: 404, description: 'Photo not found.' })
  async findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a photo record' })
  @ApiResponse({ status: 200, description: 'Photo updated successfully.' })
  @ApiResponse({ status: 404, description: 'Photo not found.' })
  async update(
    @Param('id') id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
  ) {
    return this.photosService.update(id, updatePhotoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a photo record' })
  @ApiResponse({ status: 200, description: 'Photo deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Photo not found.' })
  async remove(@Param('id') id: string) {
    return this.photosService.remove(id);
  }
}
