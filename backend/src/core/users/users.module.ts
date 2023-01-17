import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailModule } from '../email/email.module';
import { OrgInviteEmailService } from './org-invite-email.service';
import { ReadonlyService } from './readonly.service';
import { PermissionsService } from './permissions.service';
import { ApiKeysModule } from '../keys/apiKeys.module';
import { GithubModule } from '../github/github.module';
import { GithubService } from '../github/github.service';

@Module({
  providers: [
    UsersService,
    PrismaService,
    OrgInviteEmailService,
    ReadonlyService,
    PermissionsService,
    GithubService,
  ],
  imports: [PrismaService, EmailModule, ApiKeysModule, GithubModule],
  exports: [UsersService, ReadonlyService, PermissionsService],
  controllers: [UsersController],
})
export class UsersModule {}
