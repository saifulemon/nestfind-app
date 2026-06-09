import { IsUUID, IsString, IsOptional, MaxLength } from 'class-validator';

export class BookTourDto {
  @IsUUID('4')
  slotId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
