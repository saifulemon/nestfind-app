import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalApplication } from './entities/rental-application.entity';
import { ApplicationRepository } from './application.repository';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([RentalApplication]), NotificationModule],
  controllers: [ApplicationController],
  providers: [ApplicationRepository, ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
