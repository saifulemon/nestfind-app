import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { PropertyPhoto } from './entities/property-photo.entity';

@Injectable()
export class PropertyPhotoRepository extends BaseRepository<PropertyPhoto> {
  constructor(
    @InjectRepository(PropertyPhoto) repository: Repository<PropertyPhoto>,
  ) {
    super(repository);
  }

  async findByPropertyId(propertyId: string): Promise<PropertyPhoto[]> {
    return this.repository.find({
      where: { propertyId } as any,
      order: { sortOrder: 'ASC' },
    });
  }

  async findByIdAndPropertyId(
    photoId: string,
    propertyId: string,
  ): Promise<PropertyPhoto | null> {
    return this.repository.findOne({
      where: { id: photoId, propertyId } as any,
    });
  }

  async findPrimaryByPropertyId(
    propertyId: string,
  ): Promise<PropertyPhoto | null> {
    return this.repository.findOne({
      where: { propertyId, isPrimary: true } as any,
    });
  }

  async unsetPrimaryForProperty(propertyId: string): Promise<void> {
    await this.repository.update(
      { propertyId } as any,
      { isPrimary: false } as any,
    );
  }

  async setPrimary(photoId: string): Promise<void> {
    await this.repository.update(photoId, { isPrimary: true } as any);
  }

  async updateSortOrder(
    propertyId: string,
    orderMap: Map<string, number>,
  ): Promise<void> {
    const entries = Array.from(orderMap.entries());
    const cases = entries
      .map(([_, index]) => {
        const id = entries[index][0];
        return `WHEN id = '${id}' THEN ${index}`;
      })
      .join(' ');
    if (!cases) return;
    await this.repository.query(
      `UPDATE property_photos SET sort_order = CASE ${cases} END WHERE property_id = $1`,
      [propertyId],
    );
  }

  async countByPropertyId(propertyId: string): Promise<number> {
    return this.repository.count({
      where: { propertyId } as any,
    });
  }

  async softDeleteByPropertyId(propertyId: string): Promise<void> {
    await this.repository.softDelete({ propertyId } as any);
  }

  async insertBatch(data: Partial<PropertyPhoto>[]): Promise<PropertyPhoto[]> {
    const entities = this.repository.create(data as any);
    return this.repository.save(entities);
  }

  async updateSortOrderBulk(
    propertyId: string,
    photoIds: string[],
  ): Promise<void> {
    const cases = photoIds
      .map((id, index) => `WHEN id = '${id}' THEN ${index}`)
      .join(' ');
    await this.repository.query(
      `UPDATE property_photos SET sort_order = CASE ${cases} END WHERE property_id = $1`,
      [propertyId],
    );
  }
}
