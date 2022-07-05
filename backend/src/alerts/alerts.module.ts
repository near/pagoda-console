import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaService } from './prisma.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { SerdeModule } from './serde/serde.module';
import { TelegramService } from './telegram/telegram.service';
import { TriggeredAlertHistoryController } from './triggered-alert-history/triggered-alert-history.controller';
import { TriggeredAlertHistoryService } from './triggered-alert-history/triggered-alert-history.service';

@Module({
  providers: [
    AlertsService,
    PrismaService,
    TelegramService,
    TriggeredAlertHistoryService,
  ],
  controllers: [AlertsController, TriggeredAlertHistoryController],
  imports: [ProjectsModule, PrismaService, SerdeModule],
})
export class AlertsModule {}
