import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly userService: UserService) {}

  async getProfile(userId: string) {
    const user = await this.userService.findByIdOrFail(userId);
    const { password, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userService.update(userId, dto);
    if (!user) {
      return this.getProfile(userId);
    }
    const { password, ...profile } = user;
    return profile;
  }
}
