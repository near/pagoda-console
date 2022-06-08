import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaService as PrismaConsoleService } from 'src/prisma.service';
import { PrismaService } from './prisma.service';

@Module({
  providers: [AlertsService, PrismaConsoleService, PrismaService],
  controllers: [AlertsController],
  imports: [PrismaConsoleService, PrismaService],
})
export class AlertsModule {}
