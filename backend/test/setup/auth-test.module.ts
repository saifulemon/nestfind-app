import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../src/core/guards/jwt.strategy';
import { PASSPORT_AUTH_TOKEN } from '../../src/config/static-data.config';

@Module({
  imports: [PassportModule.register({ defaultStrategy: PASSPORT_AUTH_TOKEN, session: false, property: 'user' })],
  providers: [JwtStrategy],
  exports: [PassportModule, JwtStrategy],
})
export class AuthTestModule {}
