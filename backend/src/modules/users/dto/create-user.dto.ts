import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleEnum } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'Jane Doe',
    description: 'Full name (2–100 characters)',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'jane@example.com',
    description: 'Valid email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password (min 8 chars, must contain letters and numbers)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/, {
    message: 'Password must contain at least 1 letter and 1 number',
  })
  password: string;

  @ApiPropertyOptional({
    example: '+15551234567',
    description: 'Phone number (optional, max 20 characters)',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    enum: RoleEnum,
    default: RoleEnum.RENTER,
    description: 'User role (defaults to renter)',
  })
  @IsOptional()
  @IsEnum(RoleEnum)
  role?: RoleEnum;
}
