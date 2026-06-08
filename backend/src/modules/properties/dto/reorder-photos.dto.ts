import { IsArray, IsUUID, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderPhotosDto {
  @ApiProperty({ description: 'Ordered array of photo UUIDs', type: [String] })
  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  photoIds: string[];
}
