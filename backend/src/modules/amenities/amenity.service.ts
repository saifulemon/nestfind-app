import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (dto.name) {
        const existing = await queryRunner.manager.findOne(Amenity, {
          where: { name: dto.name },
          lock: { mode: 'pessimistic_write' },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException('Amenity with this name already exists!');
        }
      }
      const result = await queryRunner.manager.update(Amenity, id, dto as any);
      if (result.affected === 0) {
        throw new NotFoundException('Amenity not found');
      }
      await queryRunner.commitTransaction();
      return this.findByIdOrFail(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
