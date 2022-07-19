import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaService } from './prisma.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { SerdeModule } from './serde/serde.module';
import { TelegramService } from './telegram/telegram.service';
import { EmailsService } from 'src/emails/emails.service';
import { TriggeredAlertsController } from './triggered-alerts/triggered-alerts.controller';
import { TriggeredAlertsService } from './triggered-alerts/triggered-alerts.service';

@Module({
  providers: [
    AlertsService,
    PrismaService,
    TelegramService,
    EmailsService,
    TriggeredAlertsService,
  ],
  controllers: [AlertsController, TriggeredAlertsController],
  imports: [ProjectsModule, PrismaService, SerdeModule],
})
export class AlertsModule {}
