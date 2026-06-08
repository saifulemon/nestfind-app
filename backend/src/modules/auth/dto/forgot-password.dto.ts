import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'jane@example.com',
    description: 'Email address to send password reset link to',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
