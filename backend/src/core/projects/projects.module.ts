import { Module } from '@nestjs/common';
import { IndexerService } from '../indexer.service';
import { KeysModule } from '../keys/keys.module';
import { NearRpcService } from '@/src/core/near-rpc/near-rpc.service';
import { PrismaService } from '../prisma.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PermissionsService } from './permissions.service';
import { ReadonlyService } from './readonly.service';
import { UsersModule } from '../users/users.module';

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
  imports: [
    PrismaService,
    KeysModule,
    IndexerService,
    NearRpcService,
    UsersModule,
  ],
  exports: [ProjectsService, PermissionsService, ReadonlyService],
})
export class ProjectsModule {}
