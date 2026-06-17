import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { PropertyModule } from './modules/properties/property.module';
import { FavoriteModule } from './modules/favorites/favorite.module';
import { InquiryModule } from './modules/inquiries/inquiry.module';
import { AdminModule } from './modules/admin/admin.module';
import { AmenityModule } from './modules/amenities/amenity.module';
import { ProfileModule } from './modules/profile/profile.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { PropertyViewModule } from './modules/property-views/property-view.module';
import { RecommendationModule } from './modules/recommendations/recommendation.module';
import { SavedSearchModule } from './modules/saved-searches/saved-search.module';
import { ReviewModule } from './modules/reviews/review.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { TourModule } from './modules/tours/tour.module';
import { ChatModule } from './modules/chat/chat.module';
import { ApplicationModule } from './modules/applications/application.module';
import { TokenModule } from './infrastructure/token/token.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { LoggingModule } from './infrastructure/logging/logging.module';
import jwtConfig from './config/jwt.config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 60 }]),
    ConfigModule.forRoot({ isGlobal: true, load: [jwtConfig], envFilePath: ['.env', '.env.local'] }),
    TypeOrmModule.forRootAsync({
      useFactory: (): TypeOrmModuleOptions => {
        if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
          return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}'],
            synchronize: false,
            migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
            migrationsRun: true,
          };
        }
        return {
          type: 'sqlite',
          database: 'nestfind.sqlite',
          entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}'],
          synchronize: true,
          logging: false,
        };
      },
    }),
    TokenModule, MailModule, LoggingModule, WebsocketModule,
    AuthModule, UserModule, PropertyModule,
    FavoriteModule, InquiryModule, AdminModule, AmenityModule, ProfileModule, PropertyViewModule, RecommendationModule, SavedSearchModule, ReviewModule, NotificationModule, TourModule, ChatModule, ApplicationModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
