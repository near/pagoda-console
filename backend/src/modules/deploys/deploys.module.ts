import { ProjectsModule } from '@/src/core/projects/projects.module';
import { Module } from '@nestjs/common';
import { DeploysController } from './deploys.controller';
import { DeploysService } from './deploys.service';
import { IPFSController } from './ipfs.controller';
import { PrismaService } from './prisma.service';

@Module({
  providers: [DeploysService, PrismaService],
  imports: [ProjectsModule],
  controllers: [DeploysController, IPFSController],
})
export class DeploysModule {}
