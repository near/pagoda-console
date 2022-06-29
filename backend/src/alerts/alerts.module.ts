import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaService } from './prisma.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { SerdeModule } from './serde/serde.module';
import { TelegramService } from './telegram/telegram.service';

@Module({
  providers: [AlertsService, PrismaService, TelegramService],
  controllers: [AlertsController],
  imports: [ProjectsModule, PrismaService, SerdeModule],
})
export class AlertsModule {}
