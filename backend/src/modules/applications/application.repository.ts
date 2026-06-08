import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { RentalApplication } from './entities/rental-application.entity';

@Injectable()
export class ApplicationRepository extends BaseRepository<RentalApplication> {
  constructor(
    @InjectRepository(RentalApplication)
    repository: Repository<RentalApplication>,
  ) {
    super(repository);
  }

  async findByApplicant(applicantId: string): Promise<RentalApplication[]> {
    return this.repository.find({
      where: { applicantId } as any,
      relations: ['property', 'property.photos'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProperty(propertyId: string): Promise<RentalApplication[]> {
    return this.repository.find({
      where: { propertyId } as any,
      relations: ['applicant'],
      order: { createdAt: 'DESC' },
    });
  }
}
