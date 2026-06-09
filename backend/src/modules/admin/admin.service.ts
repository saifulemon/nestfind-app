import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../users/user.repository';
import { PropertyRepository } from '../properties/property.repository';
import { InquiryRepository } from '../inquiries/inquiry.repository';
import { FavoriteRepository } from '../favorites/favorite.repository';
import { InquiryStatusEnum } from '../../common/enums/inquiry-status.enum';
import { UserStatusEnum } from '../../common/enums/user-status.enum';

@Injectable()
export class AdminService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly propertyRepo: PropertyRepository,
    private readonly inquiryRepo: InquiryRepository,
    private readonly favoriteRepo: FavoriteRepository,
  ) {}

  async getDashboardStats() {
    const [
      totalProperties,
      totalInquiries,
      newInquiries,
      totalUsers,
      recentPropertiesRaw,
      recentInquiriesRaw,
    ] = await Promise.all([
      this.propertyRepo.count(),
      this.inquiryRepo.count(),
      this.inquiryRepo.count({
        where: { status: InquiryStatusEnum.NEW as any },
      }),
      this.userRepo.count(),
      this.propertyRepo.findAll({
        order: { createdAt: 'DESC' } as any,
        take: 5,
        select: ['id', 'title', 'price', 'propertyType', 'createdAt'],
      }),
      this.inquiryRepo.findAll({
        relations: ['property'],
        order: { createdAt: 'DESC' } as any,
        take: 5,
      }),
    ]);

    return {
      totalProperties,
      totalInquiries,
      newInquiries,
      totalUsers,
      recentProperties: recentPropertiesRaw.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        propertyType: p.propertyType,
        createdAt: p.createdAt,
      })),
      recentInquiries: recentInquiriesRaw.map((i) => ({
        id: i.id,
        name: i.name,
        email: i.email,
        propertyTitle: i.property?.title ?? null,
        status: i.status,
        createdAt: i.createdAt,
      })),
    };
  }

  async listUsers(query: {
    role?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await this.userRepo.listUsers({
      role: query.role,
      status: query.status,
      search: query.search,
      sortBy: query.sortBy,
      skip,
      take: limit,
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetail(id: string) {
    const user = await this.userRepo.findOne({
      where: { id } as any,
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'status',
        'emailVerifiedAt',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [totalFavorites, totalInquiries] = await Promise.all([
      this.favoriteRepo.count({ where: { userId: id } }),
      this.inquiryRepo.count({ where: { userId: id } }),
    ]);

    return {
      ...user,
      activity: {
        totalFavorites,
        totalInquiries,
        lastLoginAt: null,
      },
    };
  }

  async updateUserStatus(
    id: string,
    status: UserStatusEnum,
    adminId: string,
  ) {
    if (id === adminId) {
      throw new BadRequestException(
        'You cannot change the status of your own account!',
      );
    }

    const user = await this.userRepo.findOne({
      where: { id } as any,
      select: ['id', 'name', 'email', 'status', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = await (this.userRepo as any).repository.update(
      { id, status: user.status },
      { status },
    );
    if (result.affected === 0) {
      throw new BadRequestException('User status changed concurrently');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status,
      updatedAt: new Date(),
    };
  }
}
