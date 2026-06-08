import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ReplyInquiryDto {
  @ApiProperty({ description: 'Reply message', minLength: 1, maxLength: 5000 })
  @IsString({ message: 'Reply is required!' })
  @MinLength(1, { message: 'Reply is required!' })
  @MaxLength(5000, { message: 'Reply must not exceed 5000 characters!' })
  @Transform(({ value }) => (value ? value.trim() : value))
  reply: string;
}
