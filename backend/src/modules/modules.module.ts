import { Module } from '@nestjs/common';
import { AlertsModule } from './alerts/alerts.module';
import { AbiModule } from './abi/abi.module';
import { RpcstatsModule } from './rpcstats/rpcstats.module';

@Module({
  imports: [AlertsModule, AbiModule, RpcstatsModule],
})
export class ModulesModule {}
