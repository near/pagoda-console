import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaService } from './prisma.service';
import { ProjectsModule } from 'src/core/projects/projects.module';
import { SerdeModule } from './serde/serde.module';
import { TelegramService } from './telegram/telegram.service';
import { TriggeredAlertsController } from './triggered-alerts/triggered-alerts.controller';
import { TriggeredAlertsService } from './triggered-alerts/triggered-alerts.service';
import { NearRpcService } from '@/src/core/near-rpc/near-rpc.service';
import { EmailModule } from '../../core/email/email.module';

@Module({
  providers: [
    AlertsService,
    PrismaService,
    TelegramService,
    TriggeredAlertsService,
    NearRpcService,
  ],
  controllers: [AlertsController, TriggeredAlertsController],
  imports: [ProjectsModule, SerdeModule, EmailModule],
})
export class AlertsModule {}
