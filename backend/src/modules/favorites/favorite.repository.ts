import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoriteRepository extends BaseRepository<Favorite> {
  constructor(
    @InjectRepository(Favorite) repository: Repository<Favorite>,
  ) {
    super(repository);
  }

  async findByUserIdWithProperty(
    userId: string,
    skip: number,
    take: number,
  ): Promise<[Favorite[], number]> {
    return this.repository.findAndCount({
      where: { userId },
      relations: { property: { photos: true } },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async softDeleteByPropertyId(propertyId: string): Promise<void> {
    await this.repository.softDelete({ propertyId });
  }

  async findByUserAndProperty(
    userId: string,
    propertyId: string,
  ): Promise<Favorite | null> {
    return this.repository.findOne({
      where: { userId, propertyId },
    });
  }
}
