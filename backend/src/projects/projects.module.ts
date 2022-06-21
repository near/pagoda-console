import { Module } from '@nestjs/common';
import { IndexerService } from 'src/indexer.service';
import { KeysModule } from 'src/keys/keys.module';
import { PrismaService } from 'src/prisma.service';
import { PermissionsService } from './permissions.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  providers: [
    ProjectsService,
    PrismaService,
    IndexerService,
    PermissionsService,
  ],
  controllers: [ProjectsController],
  imports: [PrismaService, KeysModule, IndexerService],
  exports: [PermissionsService],
})
export class ProjectsModule {}
