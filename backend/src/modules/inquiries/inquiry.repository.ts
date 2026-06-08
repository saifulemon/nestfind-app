import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, FindOptionsWhere, QueryDeepPartialEntity } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { Inquiry } from './entities/inquiry.entity';
import { InquiryStatusEnum } from '../../common/enums/inquiry-status.enum';

@Injectable()
export class InquiryRepository extends BaseRepository<Inquiry> {
  constructor(@InjectRepository(Inquiry) repository: Repository<Inquiry>) {
    super(repository);
  }

  async findByUser(
    userId: string,
    skip: number,
    take: number,
    sortBy?: string,
  ): Promise<[Inquiry[], number]> {
    return this.repository.findAndCount({
      where: { userId },
      relations: { property: { photos: true } },
      skip,
      take,
      order: { createdAt: sortBy === 'oldest' ? 'ASC' : 'DESC' },
    });
  }

  async conditionalUpdate(
    where: FindOptionsWhere<Inquiry>,
    data: QueryDeepPartialEntity<Inquiry>,
  ): Promise<UpdateResult> {
    return this.repository.update(where, data);
  }

  async findByFilters(
    filters: {
      status?: InquiryStatusEnum;
      propertyId?: string;
      search?: string;
      sortBy?: string;
    },
    skip: number,
    take: number,
  ): Promise<[Inquiry[], number]> {
    const qb = this.repository
      .createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.property', 'property')
      .leftJoinAndSelect('property.photos', 'photos')
      .leftJoinAndSelect('inquiry.user', 'user');

    if (filters.status) {
      qb.andWhere('inquiry.status = :status', { status: filters.status });
    }

    if (filters.propertyId) {
      qb.andWhere('inquiry.propertyId = :propertyId', {
        propertyId: filters.propertyId,
      });
    }

    if (filters.search) {
      qb.andWhere(
        '(inquiry.name LIKE :search OR inquiry.email LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    qb.orderBy('inquiry.createdAt', filters.sortBy === 'oldest' ? 'ASC' : 'DESC');
    qb.skip(skip).take(take);

    return qb.getManyAndCount();
  }
}
