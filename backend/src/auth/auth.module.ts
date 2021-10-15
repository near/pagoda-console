import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { BearerStrategy } from './bearer.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthService, BearerStrategy],
})
export class AuthModule {}
