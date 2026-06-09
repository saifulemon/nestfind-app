import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { SavedSearchRepository } from './saved-search.repository';
import { SavedSearch } from './entities/saved-search.entity';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';

@Injectable()
export class SavedSearchService extends BaseService<SavedSearch> {
  constructor(
    private readonly savedSearchRepository: SavedSearchRepository,
  ) {
    super(savedSearchRepository, 'SavedSearch');
  }

  async createSavedSearch(userId: string, dto: CreateSavedSearchDto): Promise<SavedSearch> {
    return this.savedSearchRepository.create({
      userId,
      ...dto,
    });
  }

  async getUserSavedSearches(userId: string): Promise<SavedSearch[]> {
    return this.savedSearchRepository.findByUser(userId);
  }

  async toggleAlerts(userId: string, id: string, enabled: boolean): Promise<SavedSearch | null> {
    const savedSearch = await this.savedSearchRepository.findById(id);
    if (!savedSearch || savedSearch.userId !== userId) {
      return null;
    }
    return this.savedSearchRepository.update(id, { alertEnabled: enabled });
  }

  async removeByUser(userId: string, id: string): Promise<void> {
    const savedSearch = await this.savedSearchRepository.findById(id);
    if (!savedSearch || savedSearch.userId !== userId) {
      return;
    }
    await this.savedSearchRepository.softDelete(id);
  }
}
