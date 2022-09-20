import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ProjectsModule } from '../../core/projects/projects.module';
import { RpcStatsController } from './rpcstats.controller';
import { RpcStatsService } from './rpcstats.service';

@Module({
  providers: [RpcStatsService, PrismaService],
  controllers: [RpcStatsController],
  imports: [ProjectsModule],
})
export class RpcstatsModule {}
