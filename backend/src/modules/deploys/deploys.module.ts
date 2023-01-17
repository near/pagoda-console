import { GithubModule } from '@/src/core/github/github.module';
import { ProjectsModule } from '@/src/core/projects/projects.module';
import { Module } from '@nestjs/common';
import { DeploysController } from './deploys.controller';
import { DeploysService } from './deploys.service';
import { IPFSController } from './ipfs.controller';
import { PrismaService } from './prisma.service';
import { ReadonlyService } from './readonly.service';

@Module({
  providers: [DeploysService, PrismaService, ReadonlyService],
  imports: [ProjectsModule, GithubModule],
  controllers: [DeploysController, IPFSController],
  exports: [DeploysService],
})
export class DeploysModule {}
