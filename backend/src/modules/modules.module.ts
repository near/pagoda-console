import { Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [AlertsModule],
})
export class ModulesModule {}
