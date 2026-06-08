import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { SavedSearch } from './entities/saved-search.entity';

@Injectable()
export class SavedSearchRepository extends BaseRepository<SavedSearch> {
  constructor(
    @InjectRepository(SavedSearch)
    repository: Repository<SavedSearch>,
  ) {
    super(repository);
  }

  async findByUser(userId: string): Promise<SavedSearch[]> {
    return this.repository.find({
      where: { userId } as any,
      order: { createdAt: 'DESC' },
    });
  }
}
