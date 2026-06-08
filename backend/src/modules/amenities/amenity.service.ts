import { Injectable, ConflictException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryFailedError } from 'typeorm';
import { BaseService } from '../../core/base/base.service';
import { AmenityRepository } from './amenity.repository';
import { Amenity } from '../properties/entities/amenity.entity';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';

@Injectable()
export class AmenityService extends BaseService<Amenity> {
  constructor(
    private readonly amenityRepository: AmenityRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(amenityRepository, 'Amenity');
  }

  async createWithUniqueCheck(dto: CreateAmenityDto): Promise<Amenity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existing = await queryRunner.manager.findOne(Amenity, { where: { name: dto.name } });
      if (existing) {
        throw new ConflictException('Amenity with this name already exists!');
      }
      const amenity = await queryRunner.manager.save(queryRunner.manager.create(Amenity, dto as any));
      await queryRunner.commitTransaction();
      return amenity;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof ConflictException) throw err;
      throw new ConflictException('Amenity with this name already exists!');
    } finally {
      await queryRunner.release();
    }
  }

  async updateWithUniqueCheck(id: string, dto: UpdateAmenityDto): Promise<Amenity | null> {
    if (dto.name) {
      const existing = await this.amenityRepository.findByNameExcludingId(dto.name, id);
      if (existing) {
        throw new ConflictException('Amenity with this name already exists!');
      }
    }
    return this.update(id, dto as any);
  }
}
