import { Module } from '@nestjs/common';
import { NearRpcService } from '../near-rpc/near-rpc.service';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';

@Module({
  providers: [ExplorerService, NearRpcService],
  controllers: [ExplorerController],
  exports: [ExplorerService],
})
export class ExplorerModule {}
