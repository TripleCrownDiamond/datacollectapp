import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';
import { OrganizationSeederService } from './organization-seeder.service.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production-min-32-chars-long',
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OrganizationSeederService],
  exports: [JwtModule, JwtStrategy, AuthService],
})
export class AuthModule {}
