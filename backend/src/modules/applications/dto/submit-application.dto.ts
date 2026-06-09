import { IsUUID, IsNumber, IsString, IsBoolean, IsOptional, Min, Max, MaxLength, MinLength, IsDateString } from 'class-validator';

export class SubmitApplicationDto {
  @IsUUID('4')
  propertyId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyIncome?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  employmentStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  employerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  employerPhone?: string;

  @IsOptional()
  @IsDateString()
  moveInDate?: string;

  @IsOptional()
  @IsBoolean()
  hasPets?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  petDetails?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  additionalNotes?: string;
}
