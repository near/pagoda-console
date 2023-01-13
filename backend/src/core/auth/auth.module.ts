import { DeploysModule } from '@/src/modules/deploys/deploys.module';
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { BearerStrategy } from './bearer.strategy';
import { GithubBasicStrategy } from './github-basic.strategy';

@Module({
  imports: [UsersModule, DeploysModule],
  providers: [AuthService, BearerStrategy, GithubBasicStrategy],
})
export class AuthModule {}
