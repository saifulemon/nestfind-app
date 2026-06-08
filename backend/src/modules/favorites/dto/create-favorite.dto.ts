import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiProperty({ description: 'Property UUID to add to favorites' })
  @IsUUID('4', { message: 'Invalid property ID format!' })
  @IsNotEmpty({ message: 'Property ID is required!' })
  propertyId: string;
}
