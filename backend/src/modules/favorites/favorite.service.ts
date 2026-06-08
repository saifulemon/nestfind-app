import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseService } from '../../core/base/base.service';
import { Favorite } from './entities/favorite.entity';
import { FavoriteRepository } from './favorite.repository';
import { PropertyRepository } from '../properties/property.repository';

@Injectable()
export class FavoriteService extends BaseService<Favorite> {
  constructor(
    private readonly favoriteRepository: FavoriteRepository,
    private readonly propertyRepository: PropertyRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(favoriteRepository, 'Favorite');
  }

  async add(userId: string, propertyId: string): Promise<Favorite> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundException('Property not found!');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existing = await queryRunner.manager.findOne(Favorite, {
        where: { userId, propertyId } as any,
      });
      if (existing) {
        await queryRunner.commitTransaction();
        return existing;
      }
      const favorite = await queryRunner.manager.save(
        queryRunner.manager.create(Favorite, { userId, propertyId }),
      );
      await queryRunner.commitTransaction();
      return favorite;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new ConflictException('Failed to add favorite');
    } finally {
      await queryRunner.release();
    }
  }

  async removeByPropertyId(
    userId: string,
    propertyId: string,
  ): Promise<void> {
    const favorite = await this.favoriteRepository.findByUserAndProperty(
      userId,
      propertyId,
    );
    if (!favorite) {
      throw new NotFoundException('Favorite not found!');
    }
    await this.favoriteRepository.delete(favorite.id);
  }

  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    items: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;
    const [items, total] =
      await this.favoriteRepository.findByUserIdWithProperty(
        userId,
        skip,
        take,
      );

    const mapped = items.map((fav) => {
      const p = fav.property;
      const primaryPhoto = p?.photos?.find((ph) => ph.isPrimary) || p?.photos?.[0];

      return {
        id: fav.id,
        property: p
          ? {
              id: p.id,
              title: p.title,
              price: Number(p.price),
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              squareFeet: p.squareFeet,
              propertyType: p.propertyType,
              addressStreet: p.addressStreet,
              addressCity: p.addressCity,
              addressState: p.addressState,
              addressZipCode: p.addressZipCode,
              primaryPhoto: primaryPhoto
                ? { id: primaryPhoto.id, url: primaryPhoto.url, isPrimary: primaryPhoto.isPrimary }
                : null,
              photos: (p.photos || []).map((ph) => ({ id: ph.id, url: ph.url, isPrimary: ph.isPrimary })),
            }
          : null,
        createdAt: fav.createdAt,
      };
    });

    return {
      items: mapped,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    };
  }

  async isFavorited(userId: string, propertyId: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findByUserAndProperty(
      userId,
      propertyId,
    );
    return favorite !== null;
  }
}
