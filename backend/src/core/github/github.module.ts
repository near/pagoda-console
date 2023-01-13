import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GithubService } from './github.service';

@Module({
  providers: [GithubService, PrismaService],
})
export class GithubModule {}
