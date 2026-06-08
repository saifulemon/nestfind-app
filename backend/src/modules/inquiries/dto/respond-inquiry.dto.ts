import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RespondInquiryDto {
  @ApiProperty({ description: 'Response message', minLength: 10, maxLength: 5000 })
  @IsString({ message: 'Response is required!' })
  @MinLength(10, { message: 'Response must be at least 10 characters!' })
  @MaxLength(5000, { message: 'Response must not exceed 5000 characters!' })
  @Transform(({ value }) => (value ? value.trim() : value))
  response: string;
}
