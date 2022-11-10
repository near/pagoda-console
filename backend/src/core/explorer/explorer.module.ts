import { Module } from '@nestjs/common';
import { NearRpcService } from '../near-rpc/near-rpc.service';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';
import { IndexerService } from './indexer.service';

@Module({
  providers: [ExplorerService, IndexerService, NearRpcService],
  controllers: [ExplorerController],
  exports: [ExplorerService],
})
export class ExplorerModule {}
