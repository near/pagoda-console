import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { BearerStrategy } from './bearer.strategy';

@Module({
  imports: [UsersModule],
  providers: [AuthService, BearerStrategy],
})
export class AuthModule {}
