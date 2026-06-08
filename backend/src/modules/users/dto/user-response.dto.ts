import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+15551234567', nullable: true })
  phone: string | null;

  @ApiProperty({ example: 'renter' })
  role: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  emailVerifiedAt: Date | null;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  updatedAt: Date;
}
