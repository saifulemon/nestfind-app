import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Amenity } from '../properties/entities/amenity.entity';
import { AmenityRepository } from './amenity.repository';
import { AmenityService } from './amenity.service';
import { AmenityController } from './amenity.controller';
import { JwtStrategy } from '../../core/guards/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Amenity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('AUTH_JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AmenityController],
  providers: [AmenityRepository, AmenityService, JwtStrategy],
  exports: [AmenityService],
})
export class AmenityModule {}
