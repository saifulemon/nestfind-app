import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Length } from 'class-validator';
import { PropertyTypeEnum } from '../../../common/enums/property-type.enum';

export class CreateSavedSearchDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsOptional()
  searchText?: string;

  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @IsEnum(PropertyTypeEnum)
  @IsOptional()
  propertyType?: PropertyTypeEnum;

  @IsString()
  @IsOptional()
  city?: string;

  @IsBoolean()
  @IsOptional()
  alertEnabled?: boolean = true;
}
