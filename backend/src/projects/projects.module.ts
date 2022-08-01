import { Module } from '@nestjs/common';
import { IndexerService } from 'src/indexer.service';
import { KeysModule } from 'src/keys/keys.module';
import { NearRpcService } from 'src/near-rpc.service';
import { PrismaService } from 'src/prisma.service';
import { PermissionsService } from './permissions.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ReadonlyService } from './readonly.service';

@Module({
  providers: [
    ProjectsService,
    PrismaService,
    IndexerService,
    PermissionsService,
    ReadonlyService,
    NearRpcService,
  ],
  controllers: [ProjectsController],
  imports: [PrismaService, KeysModule, IndexerService, NearRpcService],
  exports: [ProjectsService, PermissionsService, ReadonlyService],
})
export class ProjectsModule {}
