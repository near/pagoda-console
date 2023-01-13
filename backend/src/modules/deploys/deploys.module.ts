import { ProjectsModule } from '@/src/core/projects/projects.module';
import { Module } from '@nestjs/common';
import { DeploysController } from './deploys.controller';
import { DeploysService } from './deploys.service';
import { PrismaService } from './prisma.service';
import { ReadonlyService } from './readonly.service';

@Module({
  providers: [DeploysService, PrismaService, ReadonlyService],
  imports: [ProjectsModule],
  controllers: [DeploysController],
  exports: [DeploysService],
})
export class DeploysModule {}
