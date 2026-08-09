import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export enum PhotoSortBy {
  TAKEN_AT = 'takenAt',
  CREATED_AT = 'createdAt',
  SORT_ORDER = 'sortOrder',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryPhotosDto {
  @ApiPropertyOptional({ description: 'Filter by User ID (UUID)' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by Category ID (UUID)' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by Topic ID (UUID)' })
  @IsOptional()
  @IsUUID()
  topicId?: string;

  @ApiPropertyOptional({ description: 'Filter by sync status (boolean)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  synced?: boolean;

  @ApiPropertyOptional({ description: 'Search photos by note content' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by takenAt start date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Filter by takenAt end date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Sort by field', enum: PhotoSortBy, default: PhotoSortBy.TAKEN_AT })
  @IsOptional()
  @IsEnum(PhotoSortBy)
  sortBy?: PhotoSortBy = PhotoSortBy.TAKEN_AT;

  @ApiPropertyOptional({ description: 'Sort direction', enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Page number', default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page limit', default: 20, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

