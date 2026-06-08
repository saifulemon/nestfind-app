import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAmenityDto {
  @ApiProperty({ example: 'Swimming Pool', description: 'Amenity name (max 50 characters)', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'pool', description: 'Icon identifier (max 50 characters)', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  icon: string;
}
