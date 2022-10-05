import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { BasicStrategy } from './basic.strategy';
import { BearerStrategy } from './bearer.strategy';

@Module({
  imports: [UsersModule],
  providers: [AuthService, BearerStrategy, BasicStrategy],
})
export class AuthModule {}
