import { Module } from '@nestjs/common';
import { IndexerService } from 'src/core/indexer.service';
import { KeysModule } from '../keys/keys.module';
import { PrismaService } from '../prisma.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  providers: [ProjectsService, PrismaService, IndexerService],
  controllers: [ProjectsController],
  imports: [PrismaService, KeysModule, IndexerService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
