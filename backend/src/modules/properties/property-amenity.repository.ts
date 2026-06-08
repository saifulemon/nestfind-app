import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyAmenity } from './entities/property-amenity.entity';

@Injectable()
export class PropertyAmenityRepository {
  constructor(
    @InjectRepository(PropertyAmenity)
    private readonly repository: Repository<PropertyAmenity>,
  ) {}

  async softDeleteByPropertyId(propertyId: string): Promise<void> {
    await this.repository.delete({ propertyId } as any);
  }

  async deleteByPropertyId(propertyId: string): Promise<void> {
    await this.repository.delete({ propertyId } as any);
  }

  async insertMany(
    entries: { propertyId: string; amenityId: string }[],
  ): Promise<void> {
    await this.repository.insert(entries as any);
  }
}
