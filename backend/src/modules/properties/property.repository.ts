import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  ILike,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { Property } from './entities/property.entity';

@Injectable()
export class PropertyRepository extends BaseRepository<Property> {
  constructor(@InjectRepository(Property) repository: Repository<Property>) {
    super(repository);
  }

  async search(filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string;
    city?: string;
    state?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Property[]; total: number }> {
    const where: FindOptionsWhere<Property>[] = [];
    const base: FindOptionsWhere<Property> = {};

    if (filters.minPrice != null) {
      (base as any).price = MoreThanOrEqual(filters.minPrice);
    }
    if (filters.maxPrice != null) {
      if (filters.minPrice != null) {
        delete (base as any).price;
      }
      (base as any).price = LessThanOrEqual(filters.maxPrice);
    }
    if (filters.bedrooms != null) {
      base.bedrooms = MoreThanOrEqual(filters.bedrooms) as any;
    }
    if (filters.bathrooms != null) {
      base.bathrooms = MoreThanOrEqual(filters.bathrooms) as any;
    }
    if (filters.propertyType) {
      base.propertyType = filters.propertyType as any;
    }
    if (filters.city) {
      base.addressCity = filters.city;
    }
    if (filters.state) {
      base.addressState = filters.state;
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      where.push({ title: ILike(searchTerm) } as any);
      where.push({ description: ILike(searchTerm) } as any);
      where.push({ addressCity: ILike(searchTerm) } as any);
    }

    if (Object.keys(base).length > 0) {
      if (where.length === 0) {
        where.push(base);
      } else {
        for (let i = 0; i < where.length; i++) {
          where[i] = { ...where[i], ...base } as any;
        }
      }
    }

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    let order: any = { createdAt: 'DESC' };
    if (filters.sortBy === 'price_asc') order = { price: 'ASC' };
    if (filters.sortBy === 'price_desc') order = { price: 'DESC' };
    if (filters.sortBy === 'newest') order = { createdAt: 'DESC' };
    if (filters.sortBy === 'oldest') order = { createdAt: 'ASC' };

    const [items, total] = await this.repository.findAndCount({
      where: where.length === 0 ? {} : where.length === 1 ? where[0] : where,
      order,
      skip,
      take: limit,
      relations: ['photos', 'propertyAmenities', 'propertyAmenities.amenity'],
    });

    return { items, total };
  }
}
