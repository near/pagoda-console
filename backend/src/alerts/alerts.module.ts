import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [AlertsService, PrismaService],
  controllers: [AlertsController],
  imports: [PrismaService],
})
export class AlertsModule {}
