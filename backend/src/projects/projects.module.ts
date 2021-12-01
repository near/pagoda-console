import { Module } from '@nestjs/common';
import { IndexerService } from 'src/indexer.service';
import { KeysModule } from 'src/keys/keys.module';
import { PrismaService } from 'src/prisma.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  providers: [ProjectsService, PrismaService, IndexerService],
  controllers: [ProjectsController],
  imports: [PrismaService, KeysModule, IndexerService],
})
export class ProjectsModule {}
