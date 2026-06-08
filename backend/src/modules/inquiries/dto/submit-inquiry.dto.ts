import { IsString, IsOptional, MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SubmitInquiryDto {
  @ApiProperty({ description: 'Inquiry message', minLength: 10, maxLength: 2000 })
  @IsString({ message: 'Message is required!' })
  @MinLength(10, { message: 'Message must be at least 10 characters!' })
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters!' })
  @Transform(({ value }) => (value ? value.trim() : value))
  message: string;

  @ApiProperty({ description: 'Name override (optional)', required: false, maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Name must be a string!' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters!' })
  name?: string;

  @ApiProperty({ description: 'Email override (optional)', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format!' })
  email?: string;

  @ApiProperty({ description: 'Phone override (optional)', required: false, maxLength: 20 })
  @IsOptional()
  @IsString({ message: 'Phone must be a string!' })
  @MaxLength(20, { message: 'Phone must not exceed 20 characters!' })
  phone?: string;
}
