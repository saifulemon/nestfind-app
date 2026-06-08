import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyView } from './entities/property-view.entity';
import { PropertyViewRepository } from './property-view.repository';
import { PropertyViewService } from './property-view.service';
import { PropertyViewController } from './property-view.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyView])],
  controllers: [PropertyViewController],
  providers: [PropertyViewRepository, PropertyViewService],
  exports: [PropertyViewService],
})
export class PropertyViewModule {}
