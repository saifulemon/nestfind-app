import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async listUsers(filters: {
    role?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    skip: number;
    take: number;
  }): Promise<[User[], number]> {
    const qb = this.repository.createQueryBuilder('user');

    if (filters.role) {
      qb.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.status) {
      qb.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters.search) {
      qb.andWhere(
        '(user.name LIKE :search OR user.email LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    switch (filters.sortBy) {
      case 'oldest':
        qb.orderBy('user.createdAt', 'ASC');
        break;
      case 'name_asc':
        qb.orderBy('user.name', 'ASC');
        break;
      case 'name_desc':
        qb.orderBy('user.name', 'DESC');
        break;
      case 'newest':
      default:
        qb.orderBy('user.createdAt', 'DESC');
        break;
    }

    qb.select([
      'user.id',
      'user.name',
      'user.email',
      'user.phone',
      'user.role',
      'user.status',
      'user.emailVerifiedAt',
      'user.createdAt',
    ]);

    qb.skip(Number(filters.skip)).take(filters.take);

    return qb.getManyAndCount();
  }
}
