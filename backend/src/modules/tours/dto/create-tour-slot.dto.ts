import { IsUUID, IsDateString, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateTourSlotDto {
  @IsUUID('4')
  propertyId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tourType?: string;
}
