import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../properties/entities/property.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { PropertyView } from '../property-views/entities/property-view.entity';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Favorite, PropertyView])],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
