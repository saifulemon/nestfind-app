import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { Amenity } from '../properties/entities/amenity.entity';

@Injectable()
export class AmenityRepository extends BaseRepository<Amenity> {
  constructor(@InjectRepository(Amenity) repository: Repository<Amenity>) {
    super(repository);
  }

  async findByName(name: string): Promise<Amenity | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findByNameExcludingId(name: string, excludeId: string): Promise<Amenity | null> {
    return this.repository
      .createQueryBuilder('amenity')
      .where('amenity.name = :name', { name })
      .andWhere('amenity.id != :excludeId', { excludeId })
      .getOne();
  }
}
