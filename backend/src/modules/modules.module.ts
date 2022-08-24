import { Module } from '@nestjs/common';
import { AlertsModule } from './alerts/alerts.module';
import { AbiModule } from './abi/abi.module';

@Module({
  imports: [AlertsModule, AbiModule],
})
export class ModulesModule {}
