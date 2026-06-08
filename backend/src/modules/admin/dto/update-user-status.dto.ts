import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatusEnum } from '../../../common/enums/user-status.enum';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatusEnum, description: 'New user status' })
  @IsNotEmpty({ message: 'Status is required!' })
  @IsEnum(UserStatusEnum, { message: 'Status must be active or suspended!' })
  status: UserStatusEnum;
}
