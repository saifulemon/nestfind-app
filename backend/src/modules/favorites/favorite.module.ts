import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Property } from '../properties/entities/property.entity';
import { FavoriteRepository } from './favorite.repository';
import { PropertyRepository } from '../properties/property.repository';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Property])],
  controllers: [FavoriteController],
  providers: [FavoriteRepository, PropertyRepository, FavoriteService],
  exports: [FavoriteService],
})
export class FavoriteModule {}
