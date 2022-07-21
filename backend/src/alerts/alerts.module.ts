import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaService } from './prisma.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { SerdeModule } from './serde/serde.module';
import { TelegramService } from './telegram/telegram.service';
import { EmailService } from 'src/email/email.service';
import { TriggeredAlertsController } from './triggered-alerts/triggered-alerts.controller';
import { TriggeredAlertsService } from './triggered-alerts/triggered-alerts.service';
import { NearRpcService } from 'src/near-rpc.service';

@Module({
  providers: [
    AlertsService,
    PrismaService,
    TelegramService,
    EmailService,
    TriggeredAlertsService,
    NearRpcService,
  ],
  controllers: [AlertsController, TriggeredAlertsController],
  imports: [ProjectsModule, PrismaService, SerdeModule, NearRpcService],
})
export class AlertsModule {}
