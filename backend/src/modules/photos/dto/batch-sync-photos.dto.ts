import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreatePhotoDto } from './create-photo.dto';

export class BatchSyncPhotosDto {
  @ApiProperty({ description: 'Array of photo records to sync', type: [CreatePhotoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhotoDto)
  photos: CreatePhotoDto[];
}
