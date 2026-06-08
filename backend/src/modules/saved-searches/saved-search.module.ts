import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedSearch } from './entities/saved-search.entity';
import { SavedSearchRepository } from './saved-search.repository';
import { SavedSearchService } from './saved-search.service';
import { SavedSearchController } from './saved-search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SavedSearch])],
  controllers: [SavedSearchController],
  providers: [SavedSearchRepository, SavedSearchService],
  exports: [SavedSearchService],
})
export class SavedSearchModule {}
