import {
  IsString,
  IsNumber,
  IsInt,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  Min,
  Max,
  Matches,
  MinLength,
  MaxLength,
  ValidateNested,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyTypeEnum } from '../../../common/enums/property-type.enum';

export class AddressDto {
  @ApiProperty({ example: '123 Main St', description: 'Street address', maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  street: string;

  @ApiProperty({ example: 'Austin', description: 'City name', maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'TX', description: 'State abbreviation or name', maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  state: string;

  @ApiProperty({ example: '78701', description: 'ZIP or postal code', maxLength: 10 })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  zipCode: string;

  @ApiPropertyOptional({ example: 30.2672, description: 'Latitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: -97.7431, description: 'Longitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'Modern Downtown Apartment', description: 'Property title (5–200 characters)', minLength: 5, maxLength: 200 })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Beautiful 2BR apartment...', description: 'Detailed description (20–5000 characters)', minLength: 20, maxLength: 5000 })
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @ApiProperty({ example: 2500, description: 'Monthly rent price in USD' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 2, description: 'Number of bedrooms' })
  @IsInt()
  @Min(0)
  bedrooms: number;

  @ApiProperty({ example: 2, description: 'Number of bathrooms' })
  @IsInt()
  @Min(0)
  bathrooms: number;

  @ApiPropertyOptional({ example: 950, description: 'Square footage' })
  @IsOptional()
  @IsInt()
  @Min(1)
  squareFeet?: number;

  @ApiProperty({ enum: PropertyTypeEnum, description: 'Type of property' })
  @IsEnum(PropertyTypeEnum)
  propertyType: PropertyTypeEnum;

  @ApiProperty({ description: 'Nested address object' })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({ example: '2026-06-01', description: 'Date when the property becomes available (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  availableFrom?: string;

  @ApiPropertyOptional({ description: 'Array of amenity UUIDs to associate with the property', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  amenityIds?: string[];
}
