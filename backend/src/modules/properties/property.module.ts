import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyPhoto } from './entities/property-photo.entity';
import { Amenity } from './entities/amenity.entity';
import { PropertyAmenity } from './entities/property-amenity.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { PropertyRepository } from './property.repository';
import { PropertyPhotoRepository } from './property-photo.repository';
import { PropertyAmenityRepository } from './property-amenity.repository';
import { AmenityRepository } from '../amenities/amenity.repository';
import { FavoriteRepository } from '../favorites/favorite.repository';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { MapSearchController } from './map-search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      PropertyPhoto,
      Amenity,
      PropertyAmenity,
      Favorite,
    ]),
  ],
  controllers: [MapSearchController, PropertyController],
  providers: [
    PropertyRepository,
    PropertyPhotoRepository,
    PropertyAmenityRepository,
    AmenityRepository,
    FavoriteRepository,
    PropertyService,
  ],
  exports: [PropertyService],
})
export class PropertyModule {}
