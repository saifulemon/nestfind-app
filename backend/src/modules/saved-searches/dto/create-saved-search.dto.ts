import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Length, Min, Max, MaxLength } from 'class-validator';
import { PropertyTypeEnum } from '../../../common/enums/property-type.enum';

export class CreateSavedSearchDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  searchText?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1000000)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1000000)
  maxPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(20)
  bedrooms?: number;

  @IsEnum(PropertyTypeEnum)
  @IsOptional()
  propertyType?: PropertyTypeEnum;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsBoolean()
  @IsOptional()
  alertEnabled?: boolean = true;
}
